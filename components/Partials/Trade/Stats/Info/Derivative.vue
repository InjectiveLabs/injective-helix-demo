<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { PerpetualMarket } from '@injectivelabs/sdk-ts'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
import { differenceInSeconds, endOfHour, intervalToDuration } from 'date-fns'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_FUNDING_RATE_DECIMALS
} from '@/app/utils/constants'
import { UiMarketWithToken, MarkPriceStatusKey } from '@/types'

const derivativeStore = useDerivativeStore()

const markPriceStatus = inject(
  MarkPriceStatusKey,
  new Status(StatusType.Loading)
)

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const labelToDisplay = ['hours', 'minutes', 'seconds']

const now = ref(0)

const { markPrice } = useDerivativeLastPrice(computed(() => props.market))

const countdown = computed(() => {
  const difference = intervalToDuration({
    start: now.value,
    end: endOfHour(now.value)
  })

  return Object.entries(difference)
    .map(([label, value]: [string, number]) => {
      if (labelToDisplay.includes(label)) {
        const valueToTwoDigits = value < 10 ? `0${value}` : `${value}`

        return valueToTwoDigits
      }

      return undefined
    })
    .filter((time) => time)
    .join(':')
})

const {
  valueToFixed: fundingRateToFixed,
  valueToBigNumber: fundingRateToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as PerpetualMarket

    return formatFundingRate({
      info: market.perpetualMarketInfo,
      funding: market.perpetualMarketFunding
    })
  }),
  {
    roundingMode: BigNumberInBase.ROUND_DOWN,
    decimalPlaces: UI_DEFAULT_FUNDING_RATE_DECIMALS
  }
)

const { valueToString: annualizedFundingRateToString } =
  useSharedBigNumberFormatter(
    computed(() => {
      const hoursInYear = 365 * 24

      return new BigNumberInBase(fundingRateToFixed.value).times(hoursInYear)
    }),
    {
      roundingMode: BigNumberInBase.ROUND_DOWN,
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

// const {
//   valueToFixed: openInterestToFixed,
//   valueToBigNumber: openInterestBigNumber
// } = useSharedBigNumberFormatter(
//   computed(
//     () =>
//       new BigNumberInBase(
//         derivativeStore.tickerOpenInterestMap[props.market.ticker] || 0
//       )
//   )
// )

useIntervalFn(() => {
  now.value = Date.now()
  const end = endOfHour(now.value)
  const shouldFetchNewFunding = differenceInSeconds(end, now.value) === 1

  if (!shouldFetchNewFunding) {
    return
  }

  derivativeStore.fetchMarketsSummary()
}, 1000)
</script>

<template>
  <PartialsTradeStatsHeaderItem class="xl:hidden 2xl:flex">
    <template #title>
      <CommonHeaderTooltip
        :tooltip="$t('trade.stats.mark_price_tooltip')"
        text-color-class="text-coolGray-400"
      >
        {{ $t('trade.mark_price') }}
      </CommonHeaderTooltip>
    </template>

    <AppSpinner v-if="markPriceStatus.isLoading()" class="relative" is-sm />
    <AppAmount
      v-else
      v-bind="{
        amount: markPrice,
        decimalPlaces: market.priceDecimals
      }"
    />
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsInfoCommon v-bind="{ market }" />

  <!-- <PartialsTradeStatsHeaderItem
    v-if="openInterestBigNumber.gt(0)"
    class="xl:hidden 2xl:flex"
    :title="$t('trade.stats.open_interest')"
  >
    <AppUsdAmount
      v-bind="{
        decimalPlaces: 0,
        isShowNoDecimals: true,
        amount: openInterestToFixed
      }"
    />
  </PartialsTradeStatsHeaderItem> -->

  <PartialsTradeStatsHeaderItem>
    <template #title>
      <CommonHeaderTooltip
        :tooltip="$t('trade.stats.funding_rate_tooltip')"
        text-color-class="text-coolGray-400"
      >
        {{ $t('trade.stats.est_funding_rate') }}
      </CommonHeaderTooltip>
    </template>

    <div v-if="!fundingRateToBigNumber.isNaN()" class="lg:text-right block">
      <AppTooltip
        :content="`${$t('trade.stats.annualized')}: ${
          fundingRateToBigNumber.gt(0) ? '+' : ''
        }${annualizedFundingRateToString}%`"
      >
        <span
          :class="{
            'text-green-500': fundingRateToBigNumber.gte(0),
            'text-red-500': fundingRateToBigNumber.lt(0)
          }"
          class="cursor-pointer flex"
        >
          <span> {{ fundingRateToBigNumber.gt(0) ? '+' : '' }}</span>
          <AppAmount
            v-bind="{
              amount: fundingRateToFixed,
              decimalPlaces: UI_DEFAULT_FUNDING_RATE_DECIMALS
            }"
          />
          <span>%</span>
        </span>
      </AppTooltip>
    </div>
    <span v-else class="lg:text-right block"> &mdash; </span>
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.next_funding')">
    <p class="lg:text-right">
      {{ countdown }}
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
