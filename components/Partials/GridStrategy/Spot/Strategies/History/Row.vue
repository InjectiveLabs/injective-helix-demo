<script lang="ts" setup>
import { format, formatDistance } from 'date-fns'
import { SharedUiSpotMarket } from '@shared/types'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import {
  GST_AUTO_PRICE_THRESHOLD,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { StopReason } from '@/types'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const spotStore = useSpotStore()

const emit = defineEmits<{
  'details:open': [strategy: TradingStrategy, market: SharedUiSpotMarket]
}>()

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const { pnl, percentagePnl, investment } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

const { lowerBound, upperBound } = useActiveGridStrategyTransformer(
  market,
  computed(() => props.strategy)
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

const { valueToString: upperBoundtoString } = useSharedBigNumberFormatter(
  upperBound,
  {
    decimalPlaces: upperBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: lowerBoundtoString } = useSharedBigNumberFormatter(
  lowerBound,
  {
    decimalPlaces: lowerBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: pnltoString } = useSharedBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: investmentToString } = useSharedBigNumberFormatter(
  investment,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function onDetailsPage() {
  emit('details:open', props.strategy, market.value)
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
          v-if="market.baseToken"
          v-bind="{ token: market.baseToken }"
        />
      </div>

      <div>
        {{ market.ticker }}
      </div>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ lowerBoundtoString }} {{ market.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ upperBoundtoString }} {{ market.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end font-semibold">
      <div class="break-words overflow-hidden">
        {{ investmentToString }} USD
      </div>
    </div>

    <div
      class="flex items-center justify-end font-semibold"
      :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
    >
      <div class="break-words overflow-hidden">
        <div>
          {{ pnltoString }}
          {{ market.quoteToken.symbol }}
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

      <span v-if="strategy.stopReason === StopReason.InsufficientFunds">
        {{ $t('sgt.insufficientFunds') }}
      </span>

      <span v-if="strategy.stopReason === StopReason.ExceededMaxRetries">
        {{ $t('sgt.exceededMaxRetries') }}
      </span>

      <span v-if="strategy.stopReason === StopReason.Emergency">
        {{ $t('sgt.marketConditionsNotSupported') }}
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
