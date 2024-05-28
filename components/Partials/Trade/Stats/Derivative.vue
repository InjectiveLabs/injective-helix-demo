<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { differenceInSeconds, endOfHour, intervalToDuration } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { SharedMarketType } from '@shared/types'
import { UiDerivativeMarket } from '@/types'

const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarket>,
    required: true
  }
})

const now = ref(0)

const labelToDisplay = ['hours', 'minutes', 'seconds']

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

const { valueToBigNumber: tWapEst } = useSharedBigNumberFormatter(
  computed(() => {
    if (!props.market.perpetualMarketFunding) {
      return ZERO_IN_BASE
    }

    const currentUnixTime = Math.floor(Date.now() / 1000)
    const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

    if (divisor.lte(0)) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      props.market.perpetualMarketFunding.cumulativePrice
    ).dividedBy(divisor)
  })
)

const { valueToBigNumber: fundingRate } = useSharedBigNumberFormatter(
  computed(() => {
    if (props.market.subType !== SharedMarketType.Perpetual) {
      return ZERO_IN_BASE
    }

    if (
      !props.market.perpetualMarketFunding ||
      !props.market.isPerpetual ||
      !props.market.perpetualMarketInfo
    ) {
      return ZERO_IN_BASE
    }

    const hourlyFundingRateCap = new BigNumberInBase(
      props.market.perpetualMarketInfo.hourlyFundingRateCap
    )
    const estFundingRate = new BigNumberInBase(
      props.market.perpetualMarketInfo.hourlyInterestRate
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
  <div>
    <div
      v-if="market.isPerpetual"
      class="p-2 text-xs flex flex-col max-lg:text-center"
    >
      <CommonHeaderTooltip
        :tooltip="$t('trade.funding_rate_tooltip')"
        text-color-class="text-gray-400"
      >
        {{ $t('trade.est_funding_rate') }}
      </CommonHeaderTooltip>
      <span
        v-if="!fundingRate.isNaN()"
        class="mt-auto lg:text-right font-mono block"
      >
        <span
          :class="{
            'text-green-500': fundingRate.gte(0),
            'text-red-500': fundingRate.lt(0)
          }"
          data-cy="market-info-funding-rate-span"
        >
          {{
            (fundingRate.gt(0) ? '+' : '') +
            fundingRate.toFormat(5, BigNumberInBase.ROUND_DOWN)
          }}%
        </span>
      </span>
      <span v-else class="mt-auto lg:text-right font-mono block">&mdash;</span>
    </div>

    <div class="p-2 text-xs flex flex-col max-lg:text-center">
      <CommonHeaderTooltip
        :tooltip="$t('trade.next_funding_tooltip')"
        text-color-class="text-gray-400"
      >
        {{ $t('trade.next_funding') }}
      </CommonHeaderTooltip>
      <p class="font-mono font-semibold lg:text-right mt-auto">
        {{ countdown }}
      </p>
    </div>
  </div>
</template>
