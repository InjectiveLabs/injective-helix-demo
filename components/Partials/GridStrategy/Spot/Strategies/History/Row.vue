<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { format, formatDistance } from 'date-fns'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const market = computed(() => gridStrategyStore.spotMarket)

const createdAt = computed(() =>
  format(new Date(Number(props.strategy.createdAt)), 'dd MMM HH:mm:ss')
)

const upperBound = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.upperBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const lowerBound = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.lowerBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const investment = computed(() => {
  if (!market.value) return ZERO_IN_BASE

  const baseAmountInUsd = new BigNumberInWei(props.strategy.baseQuantity || 0)
    .toBase(market.value?.baseToken.decimals)
    .times(
      new BigNumberInWei(props.strategy.executionPrice).toBase(
        market.value.quoteToken.decimals
      )
    )

  const quoteAmountInUsd = new BigNumberInWei(
    props.strategy.quoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  return baseAmountInUsd.plus(quoteAmountInUsd)
})

const pnl = computed(() => {
  if (!market.value) return ZERO_IN_BASE

  const creationQuoteQuantity = new BigNumberInWei(
    props.strategy.quoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  const creationBaseQuantity = new BigNumberInWei(
    props.strategy.baseQuantity
  ).toBase(market.value?.baseToken.decimals)

  const creationMidPrice = new BigNumberInWei(
    props.strategy.executionPrice
  ).toBase(market.value?.quoteToken.decimals)

  const completitionQuoteQuantity = new BigNumberInWei(
    props.strategy.quoteDeposit
  ).toBase(market.value?.quoteToken.decimals)
  const completitionBaseQuantity = new BigNumberInWei(
    props.strategy.baseDeposit
  ).toBase(market.value?.baseToken.decimals)
  const completitionMidPrice = new BigNumberInWei(
    props.strategy.marketMidPrice
  ).toBase(market.value?.quoteToken.decimals - market.value?.baseToken.decimals)

  return completitionQuoteQuantity
    .plus(completitionBaseQuantity.times(completitionMidPrice))
    .minus(
      creationQuoteQuantity.plus(creationBaseQuantity.times(creationMidPrice))
    )
})

const percentagePnl = computed(() =>
  pnl.value.dividedBy(investment.value).times(100).toFixed(2)
)

const duration = computed(() =>
  formatDistance(
    Number(props.strategy.createdAt),
    Number(props.strategy.updatedAt)
  )
)

const { valueToString: upperBoundtoString } = useBigNumberFormatter(
  upperBound,
  { decimalPlaces: 2 }
)

const { valueToString: lowerBoundtoString } = useBigNumberFormatter(
  lowerBound,
  { decimalPlaces: 2 }
)

const { valueToString: pnltoString } = useBigNumberFormatter(pnl, {
  decimalPlaces: 2
})

const { valueToString: investmentToString } = useBigNumberFormatter(
  investment,
  { decimalPlaces: 2 }
)

function onDetailsPage() {
  accountStore.$patch({
    subaccountId: addressAndMarketSlugToSubaccountId(
      walletStore.address,
      gridStrategyStore.spotMarket?.slug || 'inj-usdt'
    )
  })
}
</script>

<template>
  <div
    class="grid grid-cols-8 gap-2 even:bg-black odd:bg-gray-950 hover:bg-gray-800 p-4 text-xs"
  >
    <div class="flex items-center">
      <span>{{ createdAt }}</span>
    </div>

    <div>
      <div class="flex gap-2 items-center">
        <div class="text-left">
          <CommonTokenIcon
            v-if="market?.baseToken"
            v-bind="{ token: market?.baseToken }"
          />
        </div>

        <div>
          {{ market?.ticker }}
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end font-semibold">
      <div class="break-words overflow-hidden">$ {{ investmentToString }}</div>
    </div>

    <div
      class="flex items-center justify-end font-semibold"
      :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
    >
      <div class="break-words overflow-hidden">
        <div>$ {{ pnltoString }}</div>
        <div>{{ percentagePnl }} %</div>
      </div>
    </div>

    <div class="flex items-center justify-end">{{ duration }}</div>

    <div class="flex items-center justify-center">
      <NuxtLink
        class="underline hover:text-blue-500"
        :to="{ name: 'activity-spot' }"
        @click="onDetailsPage"
      >
        Details
      </NuxtLink>
    </div>
  </div>
</template>
