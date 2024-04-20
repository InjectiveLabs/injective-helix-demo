<script lang="ts" setup>
import { formatDistance } from 'date-fns'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import {
  GST_AUTO_PRICE_THRESHOLD,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { StopReason } from '@/types'

const spotStore = useSpotStore()

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const emit = defineEmits<{
  'details:open': [strategy: TradingStrategy, market: UiSpotMarketWithToken]
}>()

const market = computed(
  () => spotStore.markets.find((m) => m.marketId === props.strategy.marketId)!
)

const { pnl, percentagePnl, investment } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

const { lowerBound, upperBound } = useActiveGridStrategyTransformer(
  market,
  computed(() => props.strategy)
)

const duration = computed(() =>
  formatDistance(
    Number(props.strategy.createdAt),
    Number(props.strategy.updatedAt)
  )
)

const { valueToString: upperBoundToString } = useBigNumberFormatter(
  upperBound,
  {
    decimalPlaces: upperBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: lowerBoundToString } = useBigNumberFormatter(
  lowerBound,
  {
    decimalPlaces: lowerBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: pnlToString } = useBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: investmentToString } = useBigNumberFormatter(
  investment,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function onDetailsPage() {
  emit('details:open', props.strategy, market.value)
}
</script>

<template>
  <div class="text-sm space-y-2 pt-2">
    <div v-if="market" class="flex justify-between items-center">
      <p>{{ $t('sgt.market') }}</p>

      <div class="flex items-center space-x-2">
        <CommonTokenIcon v-bind="{ token: market.baseToken }" is-sm />
        <p class="font-semibold">
          {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.lowerBound') }}</p>
      <div>{{ lowerBoundToString }} {{ market.quoteToken.symbol }}</div>
    </div>

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.upperBound') }}</p>
      <div>{{ upperBoundToString }} {{ market.quoteToken.symbol }}</div>
    </div>

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.totalAmount') }}</p>
      <div>{{ investmentToString }} USD</div>
    </div>

    <div class="border-t my-2" />

    <p class="text-lg font-semibold">{{ $t('liquidity.performance') }}</p>

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.totalProfit') }}</p>
      <div
        :class="[pnl.gt(0) ? 'text-green-500' : 'text-red-500']"
        class="font-semibold"
      >
        {{ pnlToString }} {{ market.quoteToken.symbol }} ({{ percentagePnl }} %)
      </div>
    </div>

    <div class="border-t my-2" />

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.duration') }}</p>
      <div>{{ duration }}</div>
    </div>

    <div class="flex justify-between items-center">
      <p>{{ $t('sgt.stopReason') }}</p>
      <div>
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
    </div>

    <div class="flex items-center justify-center">
      <AppButton variant="primary" is-sm @click="onDetailsPage">
        <span class="text-sm font-medium">
          {{ $t('sgt.details') }}
        </span>
      </AppButton>
    </div>
  </div>
</template>
