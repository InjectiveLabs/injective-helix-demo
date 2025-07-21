<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
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

const { markPrice } = useDerivativeLastPrice(computed(() => props.market))

const now = useNow({ interval: 1000 })

const countdown = computed(() => {
  const nowTimestamp = Math.floor(now.value.getTime() / 1000)
  const secondsInHour = 3600
  const secondsSinceEpoch = nowTimestamp
  const secondsToNextEpochHour =
    secondsInHour - (secondsSinceEpoch % secondsInHour)

  const hours = Math.floor(secondsToNextEpochHour / secondsInHour)
  const minutes = Math.floor((secondsToNextEpochHour % secondsInHour) / 60)
  const seconds = secondsToNextEpochHour % 60

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

watch(countdown, (countdown) => {
  if (countdown === '00:00:01') {
    sharedDerivativeStore.fetchMarketsSummary()
  }
})
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
    <SharedAmount
      v-else
      v-bind="{
        amount: markPrice,
        useSubscript: true,
        shouldAbbreviate: false,
        decimals: market.priceDecimals
      }"
    />
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsInfoCommon v-bind="{ market }" />

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
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: fundingRateToFixed,
              decimals: UI_DEFAULT_FUNDING_RATE_DECIMALS
            }"
          >
            <template #prefix>
              <span> {{ fundingRateToBigNumber.gt(0) ? '+' : '' }}</span>
            </template>
          </SharedAmount>
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
