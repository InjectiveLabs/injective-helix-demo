<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { MarketType, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Change, UiMarketWithToken, UiMarketSummary } from '@/types'
import { metaTags } from '@/nuxt-config/meta'

const { t } = useLang()

const props = defineProps({
  lg: Boolean,
  isStatsBar: Boolean,
  isCurrentMarket: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiMarketSummary>,
    required: true
  }
})

const status = reactive(new Status(StatusType.Loading))

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const isSpot = computed(() => props.market.type === MarketType.Spot)

const lastTradedPrice = computed(() => {
  if (props.isCurrentMarket) {
    return isSpot.value
      ? spotLastTradedPrice.value
      : derivativeLastTradedPrice.value
  }

  return new BigNumberInBase(
    props.summary.lastPrice || props.summary.price || 0
  )
})

const percentageChangeStatus = computed(() => {
  if (change.value.eq(0)) {
    return Change.NoChange
  }

  return change.value.gt(0) ? Change.Increase : Change.Decrease
})

const { valueToString: lastTradedPriceToFormat } = useBigNumberFormatter(
  computed(() => lastTradedPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: changeToFormat, valueToBigNumber: change } =
  useBigNumberFormatter(
    computed(() => {
      if (!props.summary || !props.summary.change) {
        return ZERO_IN_BASE
      }

      return props.summary.change
    })
  )

watch(lastTradedPriceToFormat, (newPrice: string) => {
  const marketTypePrefix = [
    MarketType.Derivative,
    MarketType.Futures,
    MarketType.Perpetual
  ].includes(props.market.type)
    ? `| ${t('trade.futures')}`
    : ''

  if (props.isStatsBar) {
    document.title = `${newPrice} - ${props.market.ticker} ${marketTypePrefix} | ${metaTags.title}`
  }
})

onBeforeUnmount(() => (document.title = metaTags.title))

useTimeoutFn(() => status.setIdle(), 3 * 1000)
</script>

<template>
  <div>
    <div
      v-if="
        isStatsBar &&
        status.isLoading() &&
        (lastTradedPrice.isNaN() || lastTradedPrice.lte(0))
      "
    >
      <AppSpinner xs />
    </div>
    <div v-else class="flex flex-col items-end font-mono">
      <div
        class="flex items-center tracking-wide leading-none"
        :class="{ 'text-xs': !lg }"
      >
        <BaseIcon
          v-if="
            [Change.Increase, Change.Decrease].includes(percentageChangeStatus)
          "
          name="arrow"
          class="transform w-3 h-3 mr-1"
          :class="{
            'text-green-500 rotate-90':
              percentageChangeStatus === Change.Increase,
            'text-red-500 -rotate-90':
              percentageChangeStatus === Change.Decrease
          }"
        />
        <span
          data-cy="markets-last-traded-price-table-data"
          :class="{
            'text-green-500': percentageChangeStatus === Change.Increase,
            'text-white': percentageChangeStatus === Change.NoChange,
            'text-red-500': percentageChangeStatus === Change.Decrease
          }"
        >
          {{ lastTradedPriceToFormat }}
        </span>
      </div>

      <div v-if="!change.isNaN()" class="mt-1 text-xs">
        <span
          :class="{
            'text-green-500': percentageChangeStatus === Change.Increase,
            'text-white': percentageChangeStatus === Change.NoChange,
            'text-red-500': percentageChangeStatus === Change.Decrease
          }"
          data-cy="markets-change_24h-table-data"
        >
          {{ changeToFormat }}%
        </span>
      </div>
    </div>
  </div>
</template>
