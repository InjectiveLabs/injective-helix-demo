<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
import { endOfHour, intervalToDuration, differenceInSeconds } from 'date-fns'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_FUNDING_RATE_DECIMALS
} from '@/app/utils/constants'
import { MarkPriceStatusKey } from '@/types'
import type { UiMarketWithToken } from '@/types'
import type { PerpetualMarket } from '@injectivelabs/sdk-ts'

const sharedDerivativeStore = useSharedDerivativeStore()

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

const now = useNow({ interval: 1000 })

const { markPrice } = useDerivativeLastPrice(computed(() => props.market))

const countdown = computed(() => {
  const difference = intervalToDuration({
    start: now.value,
    end: endOfHour(now.value)
  })

  const { hours = 0, minutes = 0, seconds = 0 } = difference

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
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
  const end = endOfHour(now.value)
  const shouldFetchNewFunding = differenceInSeconds(end, now.value) === 1

  if (!shouldFetchNewFunding) {
    return
  }

  sharedDerivativeStore.fetchMarketsSummary()
}, 1000)
</script>

<template>
  <PartialsTradeStatsHeaderItem class="xl:hidden 2xl:flex">
    <template #title>
      <CommonHeaderTooltip
        :tooltip="$t('trade.stats.markPriceTooltip')"
        text-color-class="text-coolGray-400"
      >
        {{ $t('trade.markPrice') }}
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
    :title="$t('trade.stats.openInterest')"
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
        :tooltip="$t('trade.stats.fundingRateTooltip')"
        text-color-class="text-coolGray-400"
      >
        {{ $t('trade.stats.estFundingRate') }}
      </CommonHeaderTooltip>
    </template>

    <div v-if="!fundingRateToBigNumber.isNaN()" class="lg:text-right block">
      <AppTooltip
        :ui="{
          width: 'w-auto',
          popper: {
            placement: 'bottom'
          }
        }"
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

  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.nextFunding')">
    <p class="lg:text-right">
      {{ countdown }}
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
