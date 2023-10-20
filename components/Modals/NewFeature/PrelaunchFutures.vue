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
      <img src="/newFeatures/prelaunch-futures.webp" alt="" />
    </template>

    <template #title>
      {{ $t('banners.newFeature.prelaunchFutures.title') }}
    </template>

    <template #description>
      <div>
        {{ $t('banners.newFeature.prelaunchFutures.description1') }}
      </div>
      <div>
        {{ $t('banners.newFeature.prelaunchFutures.description2') }}
      </div>
    </template>

    <template #cta>
      {{
        $t(`banners.newFeature.prelaunchFutures.${market ? 'cta' : 'continue'}`)
      }}
    </template>
  </ModalsNewFeatureWrapper>
</template>
