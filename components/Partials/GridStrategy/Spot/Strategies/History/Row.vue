<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { format, formatDistance } from 'date-fns'
import { BigNumberInWei } from '@injectivelabs/utils'
import { StopReason } from '@/types'
import { addressAndMarketSlugToSubaccountId } from 'app/utils/helpers'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const walletStore = useWalletStore()
const gridStrategyStore = useGridStrategyStore()

const emit = defineEmits<{
  'open:details': [strategy: TradingStrategy, market: UiSpotMarketWithToken]
}>()

const market = computed(() => gridStrategyStore.spotMarket!)

const { aggregatedPortfolioBalances } = useBalance()

const { pnl, percentagePnl } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

const { lowerBound, upperBound } = useActiveGridStrategyTransformer(
  market,
  computed(() => props.strategy)
)

const marketSubaccountId = computed(() =>
  addressAndMarketSlugToSubaccountId(walletStore.address, market.value.slug)
)

const subaccountBalances = computed(
  () => aggregatedPortfolioBalances.value[marketSubaccountId.value]
)

const accountTotalBalanceInUsd = computed(() =>
  subaccountBalances.value.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
    ZERO_IN_BASE
  )
)

const createdAt = computed(() =>
  format(new Date(Number(props.strategy.createdAt)), 'dd MMM HH:mm:ss')
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
  accountTotalBalanceInUsd,
  { decimalPlaces: 2 }
)

function onDetailsPage() {
  emit('open:details', props.strategy, market.value)
}
</script>

<template>
  <div
    class="grid grid-cols-9 gap-2 even:bg-black odd:bg-gray-950 hover:bg-gray-800 p-4 text-xs"
  >
    <div class="flex items-center">
      <span>{{ createdAt }}</span>
    </div>

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

    <div class="flex items-center justify-end">
      <span>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end font-semibold">
      <div class="break-words overflow-hidden">
        {{ investmentToString }}
        {{ gridStrategyStore.spotMarket?.quoteToken.symbol }}
      </div>
    </div>

    <div
      class="flex items-center justify-end font-semibold"
      :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
    >
      <div class="break-words overflow-hidden">
        <div>
          {{ pnltoString }}
          {{ gridStrategyStore.spotMarket?.quoteToken.symbol }}
        </div>
        <div>{{ percentagePnl }} %</div>
      </div>
    </div>

    <div class="flex items-center justify-end">{{ duration }}</div>

    <div class="flex items-center justify-end">
      <span v-if="strategy.stopReason === StopReason.User">
        {{ $t('sgt.user') }}
      </span>

      <span v-if="strategy.stopReason === StopReason.StopLoss">
        {{ $t('sgt.stopLoss') }}
      </span>

      <span v-if="strategy.stopReason === StopReason.TakeProfit">
        {{ $t('sgt.takeProfit') }}
      </span>
    </div>

    <div class="flex items-center justify-center">
      <div
        class="underline hover:text-blue-500 cursor-pointer"
        @click="onDetailsPage"
      >
        {{ $t('sgt.details') }}
      </div>
    </div>
  </div>
</template>
