<script lang="ts" setup>
import { getMarketRoute } from '@/app/utils/market'
import { Modal, MainPage } from '@/types'

const derivativeStore = useDerivativeStore()

const market = computed(() => {
  const MARKET_SLUG = 'tradfi-usdt-perp'

  return derivativeStore.marketByIdOrSlug(MARKET_SLUG)
})

const marketRoute = computed(() => {
  if (!market.value) {
    return {
      name: MainPage.Index
    }
  }

  return getMarketRoute(market.value)
})
</script>

<template>
  <ModalsNewFeatureWrapper
    v-bind="{ ctaRoute: marketRoute }"
    :modal="Modal.NewFeatureTradFiLaunch"
  >
    <template #image>
      <img src="/svg/tradfihelix.svg" alt="TradFi Launch" class="mx-auto" />
    </template>

    <template #title>
      <span>{{ $t('banners.newFeature.title') }}</span>
    </template>

    <template #description>
      <span>{{ $t('banners.newFeature.description') }}</span>
    </template>

    <template #cta>
      <span>{{ $t('banners.newFeature.cta') }}</span>
    </template>
  </ModalsNewFeatureWrapper>
</template>
