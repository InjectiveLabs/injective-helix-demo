<script setup lang="ts">
import { format } from 'date-fns'
import {
  durationFormatter,
  getSgtContractAddressFromSlug
} from '@/app/utils/helpers'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const gridStrategyStore = useGridStrategyStore()

const now = ref(Date.now())

const market = computed(() => gridStrategyStore.spotMarket!)
const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug)
    )!
)

const { percentagePnl, pnl } = useActiveGridStrategy(market, activeStrategy)
const {
  creationBaseQuantity,
  creationExecutionPrice,
  creationQuoteQuantity,
  lowerBound,
  upperBound
} = useActiveGridStrategyTransformer(market, activeStrategy)

const createdAtFormatted = computed(() =>
  format(new Date(Number(activeStrategy.value.createdAt)), 'dd MMM HH:mm:ss')
)

const durationFormatted = computed(() =>
  durationFormatter(activeStrategy.value.createdAt, now.value)
)

const { valueToString: upperBoundtoString } = useBigNumberFormatter(
  upperBound,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: lowerBoundtoString } = useBigNumberFormatter(
  lowerBound,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: creationExecutionPriceToString } = useBigNumberFormatter(
  creationExecutionPrice,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: pnltoString } = useBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: creationBaseQuantityToString } = useBigNumberFormatter(
  creationBaseQuantity,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: creationQuoteQuantitytoString } = useBigNumberFormatter(
  creationQuoteQuantity,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

useIntervalFn(() => {
  now.value = Date.now()
}, 1000 * 60)
</script>

<template>
  <div class="divide-y-0">
    <div class="flex items-center justify-between mb-2">
      <p class="font-bold text-lg">{{ $t('sgt.gridDetails') }}</p>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <p>{{ $t('sgt.running') }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.timeCreated') }}</p>
      <p class="text-sm">{{ createdAtFormatted }}</p>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.duration') }}</p>
      <p class="text-sm">{{ durationFormatted }}</p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right text-sm">
        <p>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.initialEntryPrice') }}</span>
        <AppTooltip :content="$t('sgt.initialEntryTooltip')" />
      </p>
      <p class="text-sm">
        {{ creationExecutionPriceToString }} {{ market?.quoteToken.symbol }}
      </p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center self-start space-x-2">
        <span>{{ $t('sgt.investment') }}</span>
        <AppTooltip :content="$t('sgt.investmentAmountTooltip')" />
      </p>
      <div class="text-right text-sm">
        <p>{{ creationBaseQuantityToString }} {{ market?.baseToken.symbol }}</p>
        <p>
          {{ creationQuoteQuantitytoString }} {{ market?.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <div class="flex justify-between">
      <p class="text-gray-400 text-sm">{{ $t('sgt.totalProfit') }}</p>
      <div
        class="text-right font-bold text-sm"
        :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
      >
        <p>{{ pnltoString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ percentagePnl }} %</p>
      </div>
    </div>
  </div>
</template>
