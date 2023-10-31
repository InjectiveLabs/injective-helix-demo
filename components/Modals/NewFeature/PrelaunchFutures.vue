<script lang="ts" setup>
import { getMarketRoute } from '@/app/utils/market'

const derivativeStore = useDerivativeStore()

const BLOG_POST_URL =
  'https://helixapp.zendesk.com/hc/en-us/articles/8222748486159-Celestia-TIA-Pre-Launch-Futures-Trading-Competition-with-5-000-TIA-in-Rewards-'

const market = computed(() => {
  const MARKET_SLUG = 'tia-usdt-30nov2023'

  return derivativeStore.markets.find(({ slug }) => slug === MARKET_SLUG)
})

const route = computed(() => {
  if (!market.value) {
    return {
      name: 'index'
    }
  }

  return getMarketRoute(market.value)
})
</script>

<template>
  <ModalsNewFeatureWrapper v-bind="{ to: route }">
    <template #image>
      <img src="/newFeatures/tia-campaign.webp" alt="" />
    </template>

    <template #title>
      {{ $t('banners.newFeature.title') }}
    </template>

    <template #description>
      <div>
        {{ $t('banners.newFeature.description1') }}
      </div>
      <div>
        {{ $t('banners.newFeature.description2') }}
      </div>

      <i18n-t tag="p" keypath="banners.newFeature.description3">
        <template #link>
          <NuxtLink
            :to="BLOG_POST_URL"
            target="_blank"
            class="text-blue-500 hover:text-blue-400"
          >
            {{ $t('banners.newFeature.blogPost') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </template>
  </ModalsNewFeatureWrapper>
</template>
