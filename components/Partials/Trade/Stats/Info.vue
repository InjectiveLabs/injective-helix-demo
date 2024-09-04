<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketChange, SharedMarketType } from '@shared/types'
import { differenceInSeconds, endOfHour, intervalToDuration } from 'date-fns'
import { stableCoinSymbols } from '@/app/data/token'
import { UiDerivativeMarket, UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const labelToDisplay = ['hours', 'minutes', 'seconds']

const now = ref(0)

const isSpot = computed(() => props.market.type === SharedMarketType.Spot)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

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

const summary = computed(() => {
  if (isSpot.value) {
    return spotStore.marketsSummary.find(
      (market) => market.marketId === props.market.marketId
    )
  }

  return derivativeStore.marketsSummary.find(
    (market) => market.marketId === props.market.marketId
  )
})

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const lastTradedPrice = computed(() =>
  isSpot.value ? spotLastTradedPrice.value : derivativeLastTradedPrice.value
)

const lastTradedPriceInUsd = computed(() =>
  lastTradedPrice.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
)

const percentageChangeStatus = computed(() => {
  if (change.value.eq(0)) {
    return SharedMarketChange.NoChange
  }

  return change.value.gt(0)
    ? SharedMarketChange.Increase
    : SharedMarketChange.Decrease
})

const { valueToString: volumeToFormat, valueToBigNumber: volume } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.value.volume)
    }),
    {
      decimalPlaces: stableCoinSymbols.includes(props.market.quoteToken.symbol)
        ? 0
        : props.market.priceDecimals
    }
  )

const { valueToString: volumeInUsdToFormat } = useSharedBigNumberFormatter(
  computed(() =>
    volume.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
  ),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: lastTradedPriceToFormat } = useSharedBigNumberFormatter(
  computed(() => lastTradedPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: lastTradedPriceInUsdToFormat } =
  useSharedBigNumberFormatter(
    computed(() => lastTradedPriceInUsd.value),
    {
      decimalPlaces: props.market.priceDecimals,
      displayAbsoluteDecimalPlace: true
    }
  )

const { valueToString: changeToFormat, valueToBigNumber: change } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value || !summary.value.change) {
        return ZERO_IN_BASE
      }

      return summary.value.change
    })
  )

const { valueToString: highToFormat } = useSharedBigNumberFormatter(
  computed(() => {
    if (!summary.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(summary.value.high)
  }),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: lowToFormat } = useSharedBigNumberFormatter(
  computed(() => {
    if (!summary.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(summary.value.low)
  }),
  {
    decimalPlaces: props.market.priceDecimals,
    minimalDecimalPlaces: props.market.priceDecimals
  }
)

const { valueToBigNumber: tWapEst } = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as UiDerivativeMarket

    if (!market.perpetualMarketFunding) {
      return ZERO_IN_BASE
    }

    const currentUnixTime = Math.floor(Date.now() / 1000)
    const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

    if (divisor.lte(0)) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      market.perpetualMarketFunding?.cumulativePrice || 0
    ).dividedBy(divisor)
  })
)

const { valueToBigNumber: fundingRate } = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as UiDerivativeMarket

    if (market.subType !== SharedMarketType.Perpetual) {
      return ZERO_IN_BASE
    }

    if (
      !market.perpetualMarketFunding ||
      !market.isPerpetual ||
      !market.perpetualMarketInfo
    ) {
      return ZERO_IN_BASE
    }

    const hourlyFundingRateCap = new BigNumberInBase(
      market.perpetualMarketInfo.hourlyFundingRateCap
    )
    const estFundingRate = new BigNumberInBase(
      market.perpetualMarketInfo.hourlyInterestRate
    ).plus(tWapEst.value)

    if (estFundingRate.gt(hourlyFundingRateCap)) {
      return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
    }

    if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
      return new BigNumberInBase(hourlyFundingRateCap)
        .times(-1)
        .multipliedBy(100)
    }

    return new BigNumberInBase(estFundingRate).multipliedBy(100)
  })
)

const { valueToBigNumber: annualizedFundingRate } = useSharedBigNumberFormatter(
  computed(() => {
    const hoursInYear = 365 * 24

    return fundingRate.value.times(hoursInYear)
  }),
  {
    decimalPlaces: 5
  }
)

useIntervalFn(() => {
  now.value = Date.now()
  const end = endOfHour(now.value)
  const shouldFetchNewFunding = differenceInSeconds(end, now.value) === 1

  if (shouldFetchNewFunding) {
    derivativeStore.fetchMarket(props.market.marketId)
  }
}, 1000)
</script>

<template>
  <div
    class="lg:flex max-lg:text-xs max-lg:p-1 max-lg:divide-y max-lg:[&>*]:p-1"
  >
    <section class="flex p-2 justify-between">
      <p class="text-gray-400 lg:hidden">{{ $t('trade.price') }}</p>

      <article
        class="flex items-center lg:flex-col lg:items-end lg:justify-between lg:px-2 font-mono lg:py-0.5"
      >
        <div class="flex items-center justify-between">
          <div
            class="flex items-center"
            :class="{
              'text-green-500':
                percentageChangeStatus === SharedMarketChange.Increase,
              'text-red-500 ':
                percentageChangeStatus === SharedMarketChange.Decrease
            }"
          >
            <SharedIcon
              v-if="
                [
                  SharedMarketChange.Increase,
                  SharedMarketChange.Decrease
                ].includes(percentageChangeStatus)
              "
              name="arrow"
              class="w-3 h-3 mr-1"
              :class="{
                ' rotate-90':
                  percentageChangeStatus === SharedMarketChange.Increase,
                ' -rotate-90':
                  percentageChangeStatus === SharedMarketChange.Decrease
              }"
            />

            <div class="leading-none">
              {{ lastTradedPriceToFormat }}
            </div>
          </div>
        </div>

        <div
          v-if="!change.isNaN()"
          class="leading-none text-xs"
          :class="{
            'text-green-500':
              percentageChangeStatus === SharedMarketChange.Increase,
            'text-white':
              percentageChangeStatus === SharedMarketChange.NoChange,
            'text-red-500':
              percentageChangeStatus === SharedMarketChange.Decrease
          }"
        >
          <span class="lg:hidden">/</span>
          <span> {{ changeToFormat }}% </span>
        </div>
      </article>
    </section>

    <PartialsTradeStatsHeaderItem
      v-if="!isStableQuoteAsset"
      :title="$t('trade.usd_value')"
    >
      <p class="font-mono font-semibold">
        {{ lastTradedPriceInUsdToFormat }}
      </p>
    </PartialsTradeStatsHeaderItem>

    <PartialsTradeStatsHeaderItem>
      <template #title>
        <CommonHeaderTooltip
          :tooltip="
            isStableQuoteAsset
              ? $t('trade.market_volume_24h_tooltip')
              : $t('trade.total_volume_in_usd', {
                  amount: volumeInUsdToFormat
                })
          "
          text-color-class="text-gray-400"
        >
          {{ $t('trade.total_market_volume_24h') }}
        </CommonHeaderTooltip>
      </template>
      <p class="font-mono font-semibold">{{ volumeToFormat }}</p>
    </PartialsTradeStatsHeaderItem>

    <PartialsTradeStatsHeaderItem :title="$t('trade.high')">
      <p class="font-mono font-semibold">{{ highToFormat }}</p>
    </PartialsTradeStatsHeaderItem>

    <PartialsTradeStatsHeaderItem :title="$t('trade.low')">
      <p class="font-mono font-semibold">{{ lowToFormat }}</p>
    </PartialsTradeStatsHeaderItem>

    <template v-if="(market as UiDerivativeMarket)?.isPerpetual">
      <PartialsTradeStatsHeaderItem>
        <template #title>
          <CommonHeaderTooltip
            :tooltip="$t('trade.funding_rate_tooltip')"
            text-color-class="text-gray-400"
          >
            {{ $t('trade.est_funding_rate') }}
          </CommonHeaderTooltip>
        </template>

        <div v-if="!fundingRate.isNaN()" class="lg:text-right font-mono block">
          <AppTooltip
            :content="`${$t('trade.annualized')} ${
              fundingRate.gt(0) ? '+' : ''
            } ${annualizedFundingRate.toFormat(
              5,
              BigNumberInBase.ROUND_DOWN
            )}%`"
          >
            <span
              :class="{
                'text-green-500': fundingRate.gte(0),
                'text-red-500': fundingRate.lt(0)
              }"
              class="cursor-pointer"
            >
              {{
                (fundingRate.gt(0) ? '+' : '') +
                fundingRate.toFormat(5, BigNumberInBase.ROUND_DOWN)
              }}%
            </span>
          </AppTooltip>
        </div>
        <span v-else class="lg:text-right font-mono block"> &mdash; </span>
      </PartialsTradeStatsHeaderItem>

      <PartialsTradeStatsHeaderItem>
        <template #title>
          <CommonHeaderTooltip
            :tooltip="$t('trade.next_funding_tooltip')"
            text-color-class="text-gray-400"
          >
            {{ $t('trade.next_funding') }}
          </CommonHeaderTooltip>
        </template>

        <p class="font-mono font-semibold lg:text-right">
          {{ countdown }}
        </p>
      </PartialsTradeStatsHeaderItem>
    </template>
  </div>
</template>
