<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { format, formatDistance } from 'date-fns'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { backupPromiseCall } from '@/app/utils/async'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

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
        market.value?.quoteToken.decimals
      )
    )

  const quoteAmountInUsd = new BigNumberInWei(
    props.strategy.quoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  return baseAmountInUsd.plus(quoteAmountInUsd)
})

const subaccountBalances = computed(
  () =>
    accountStore.subaccountBalancesMap[
      addressAndMarketSlugToSubaccountId(
        walletStore.address,
        market.value?.slug || ''
      )
    ]
)

const pnl = computed(() => {
  if (!market.value || !subaccountBalances.value) {
    return ZERO_IN_BASE
  }

  const creationQuoteQuantity = new BigNumberInWei(
    props.strategy.quoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  const creationBaseQuantity = new BigNumberInWei(
    props.strategy.baseQuantity
  ).toBase(market.value?.baseToken.decimals)

  const creationMidPrice = new BigNumberInWei(
    props.strategy.executionPrice
  ).toBase(market.value?.quoteToken.decimals)

  const currentQuoteQuantity = new BigNumberInWei(
    subaccountBalances.value.find(
      (balance) => balance.denom === market.value?.quoteDenom
    )?.totalBalance || 0
  ).toBase(market.value?.quoteToken.decimals)

  const currentBaseQuantity = new BigNumberInWei(
    subaccountBalances.value.find(
      (balance) => balance.denom === market.value?.baseDenom
    )?.totalBalance || 0
  ).toBase(market.value?.baseToken.decimals)

  const orderbookBuy = new BigNumberInWei(
    spotStore.orderbook?.buys[0]?.price || 0
  ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

  const orderbookSell = new BigNumberInWei(
    spotStore.orderbook?.sells[0]?.price || 0
  ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

  const currentMidPrice = orderbookSell
    .minus(orderbookBuy)
    .dividedBy(2)
    .plus(orderbookSell)

  return currentQuoteQuantity
    .plus(currentBaseQuantity.times(currentMidPrice))
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

function onRemoveStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategy()
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.strategyRemoved')
      })

      backupPromiseCall(() => accountStore.fetchAccountPortfolio())
      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

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
    class="grid grid-cols-9 gap-2 even:bg-black odd:bg-gray-950 hover:bg-gray-800 p-4 text-xs"
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
      <span>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end break-words font-semibold">
      <div>
        {{ investmentToString }}
        {{ gridStrategyStore.spotMarket?.quoteToken.symbol }}
      </div>
    </div>

    <div
      class="flex items-center justify-end break-words font-semibold"
      :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
    >
      <div>
        <div>
          {{ pnltoString }}
          {{ gridStrategyStore.spotMarket?.quoteToken.symbol }}
        </div>
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

    <div class="flex items-center justify-center">
      <PartialsCommonCancelButton
        v-bind="{ status }"
        @click="onRemoveStrategy"
      />
    </div>
  </div>
</template>
