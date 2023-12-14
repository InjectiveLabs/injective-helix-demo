<script lang="ts" setup>
import { intervalToDuration, formatDuration } from 'date-fns'
import { getMarketRoute } from '@/app/utils/market'
import { Modal, MainPage } from '@/types'

const spotStore = useSpotStore()

// const TWITTER_URL = 'https://twitter.com/search?q=%24TIA&src=cashtag_click'
// const BLOG_POST_URL =
//   'https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-'

const now = ref(Date.now())
const market = computed(() => {
  const MARKET_SLUG = 'talis-usdt'

  return spotStore.markets.find(({ slug }) => slug === MARKET_SLUG)
})

const marketRoute = computed(() => {
  if (!market.value) {
    return {
      name: MainPage.Index
    }
  }

  return getMarketRoute(market.value)
})

const countdown = computed(() => {
  const labelToDisplay = ['hours', 'minutes', 'seconds']
  const difference = intervalToDuration({
    start: now.value,
    end: new Date('2023-12-14T15:00:00Z')
  })

  const nonzero = Object.entries(difference)
    .filter(([_, value]) => (value || 0) > 0)
    .map(([unit, _]) => unit)

  return formatDuration(difference, {
    format: labelToDisplay.filter((i) => new Set(nonzero).has(i)).slice(0, 3),
    delimiter: ' '
  })
})

const swapRoute = computed(() => {
  return {
    name: MainPage.Swap,
    query: {
      from: market.value?.quoteDenom,
      to: market.value?.baseDenom,
      toAmount: '10'
    }
  }
})

useIntervalFn(() => {
  now.value = Date.now()
}, 1000)
</script>

<template>
  <ModalsNewFeatureWrapper
    v-bind="{ route1: marketRoute, route2: swapRoute, launchAt: '' }"
    :modal="Modal.NewFeatureTalis"
  >
    <template #image>
      <img src="/newFeatures/talis-launch.webp" alt="Talis Launch" />
    </template>

    <template #title>
      <i18n-t tag="div" keypath="banners.newFeature.title"> </i18n-t>
    </template>

    <template #countdown>
      <span class="text-primary-500">{{ countdown }}</span>
    </template>

    <template v-if="false" #description>
      <i18n-t tag="div" keypath="banners.newFeature.description"> </i18n-t>
    </template>

    <template v-if="false" #cta1>
      <span>{{ $t('banners.newFeature.cta1') }}</span>
    </template>

    <template v-if="false" #cta2>
      <span>{{ $t('banners.newFeature.cta2') }}</span>
    </template>
  </ModalsNewFeatureWrapper>
</template>
