<script lang="ts" setup>
import { PropType } from 'vue'
import { differenceInSeconds, endOfHour, intervalToDuration } from 'date-fns'
import {
  UiDerivativeMarketWithToken,
  UiPerpetualMarketWithToken
} from '@injectivelabs/sdk-ui-ts'

const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const isPerpetualMarket = computed(
  () => (props.market as UiPerpetualMarketWithToken).isPerpetual
)

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
  <CommonMarketInfo
    v-if="isPerpetualMarket"
    :title="$t('trade.next_funding')"
    :tooltip="$t('trade.next_funding_tooltip')"
  >
    <span
      class="text-xs lg:text-right font-mono block"
      data-cy="market-info-next-funding-span"
    >
      {{ countdown }}
    </span>
  </CommonMarketInfo>
</template>
