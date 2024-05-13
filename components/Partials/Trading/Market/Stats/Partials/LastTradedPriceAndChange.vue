<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import {
  SharedMarketType,
  SharedMarketChange,
  SharedUiMarketSummary
} from '@shared/types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { metaTags } from '@/nuxt-config/meta'
import { UiMarketWithToken } from '@/types'

const { t } = useLang()

const props = defineProps({
  isLg: Boolean,
  isStatsBar: Boolean,
  isCurrentMarket: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<SharedUiMarketSummary>,
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

const isSpot = computed(() => props.market.type === SharedMarketType.Spot)

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
    return SharedMarketChange.NoChange
  }

  return change.value.gt(0)
    ? SharedMarketChange.Increase
    : SharedMarketChange.Decrease
})

const { valueToString: lastTradedPriceToFormat } = useSharedBigNumberFormatter(
  computed(() => lastTradedPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: changeToFormat, valueToBigNumber: change } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!props.summary || !props.summary.change) {
        return ZERO_IN_BASE
      }

      return props.summary.change
    })
  )

watch(lastTradedPriceToFormat, (newPrice: string) => {
  const marketTypePrefix = [
    SharedMarketType.Derivative,
    SharedMarketType.Futures,
    SharedMarketType.Perpetual
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
      <AppSpinner is-xs />
    </div>
    <div v-else class="flex flex-col items-end font-mono">
      <div
        class="flex items-center tracking-wide leading-none"
        :class="{ 'text-xs': !isLg }"
      >
        <SharedIcon
          v-if="
            [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
              percentageChangeStatus
            )
          "
          name="arrow"
          class="w-3 h-3 mr-1"
          :class="{
            'text-green-500 rotate-90':
              percentageChangeStatus === SharedMarketChange.Increase,
            'text-red-500 -rotate-90':
              percentageChangeStatus === SharedMarketChange.Decrease
          }"
        />
        <span
          data-cy="markets-last-traded-price-table-data"
          :class="{
            'text-green-500':
              percentageChangeStatus === SharedMarketChange.Increase,
            'text-white':
              percentageChangeStatus === SharedMarketChange.NoChange,
            'text-red-500':
              percentageChangeStatus === SharedMarketChange.Decrease
          }"
        >
          {{ lastTradedPriceToFormat }}
        </span>
      </div>

      <div v-if="!change.isNaN()" class="mt-1 text-xs">
        <span
          :class="{
            'text-green-500':
              percentageChangeStatus === SharedMarketChange.Increase,
            'text-white':
              percentageChangeStatus === SharedMarketChange.NoChange,
            'text-red-500':
              percentageChangeStatus === SharedMarketChange.Decrease
          }"
          data-cy="markets-change_24h-table-data"
        >
          {{ changeToFormat }}%
        </span>
      </div>
    </div>
  </div>
</template>
