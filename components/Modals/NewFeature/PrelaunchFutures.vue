<script lang="ts" setup>
import { getMarketRoute } from '@/app/utils/market'

const derivativeStore = useDerivativeStore()

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
      <div class="min-h-[252px]">
        <img
          src="https://helixapp.zendesk.com/hc/article_attachments/8162140444431"
        />
      </div>
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
    </template>

    <template #cta>
      {{ $t(`banners.newFeature.${market ? 'cta' : 'continue'}`) }}
    </template>
  </ModalsNewFeatureWrapper>
</template>
