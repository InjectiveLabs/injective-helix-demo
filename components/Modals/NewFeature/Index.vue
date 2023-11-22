<script lang="ts" setup>
import { getMarketRoute } from '@/app/utils/market'
import { Modal, MainPage } from '@/types'

const spotStore = useSpotStore()

const TWITTER_URL = 'https://twitter.com/search?q=%24TIA&src=cashtag_click'
const BLOG_POST_URL =
  'https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-'

const market = computed(() => {
  const MARKET_SLUG = 'tia-usdt'

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
</script>

<template>
  <ModalsNewFeatureWrapper
    v-bind="{ route1: marketRoute, route2: swapRoute }"
    :modal="Modal.NewFeature"
  >
    <template #image>
      <img src="/newFeatures/tia-campaign.webp" alt="Tia Spot Campaign" />
    </template>

    <template #title>
      <i18n-t tag="div" keypath="banners.newFeature.title">
        <template #link>
          <NuxtLink
            :to="TWITTER_URL"
            target="_blank"
            class="text-blue-500 hover:text-blue-400"
          >
            {{ $t('banners.newFeature.tia') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </template>

    <template #description>
      <i18n-t tag="div" keypath="banners.newFeature.description1">
        <template #link>
          <NuxtLink
            :to="BLOG_POST_URL"
            target="_blank"
            class="text-blue-500 hover:text-blue-400"
          >
            {{ $t('banners.newFeature.here') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </template>

    <template #cta1>
      <span>{{ $t('banners.newFeature.cta1') }}</span>
    </template>

    <template #cta2>
      <span>{{ $t('banners.newFeature.cta2') }}</span>
    </template>
  </ModalsNewFeatureWrapper>
</template>
