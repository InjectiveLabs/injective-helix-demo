<script lang="ts" setup>
import { getMarketRoute } from '@/app/utils/market'
import { Modal, MainPage } from '@/types'

const derivativeStore = useDerivativeStore()

const market = computed(() => {
  const MARKET_SLUG = 'tradfi-usdt-perp'

  return derivativeStore.markets.find(({ slug }) => slug === MARKET_SLUG)
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
    v-bind="{ route1: marketRoute }"
    :modal="Modal.NewFeatureTradFiLaunch"
  >
    <template #image>
      <img src="/svg/tradfihelix.svg" alt="TradFi Launch" class="mx-auto" />
    </template>

    <template #title>
      <i18n-t tag="div" keypath="banners.newFeature.title"> </i18n-t>
    </template>

    <template #description>
      <i18n-t tag="div" keypath="banners.newFeature.description"> </i18n-t>
    </template>

    <template #cta1>
      <span>{{ $t('banners.newFeature.cta1') }}</span>
    </template>
  </ModalsNewFeatureWrapper>
</template>
