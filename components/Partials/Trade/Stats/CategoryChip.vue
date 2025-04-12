<script lang="ts" setup>
import { UiMarketWithToken } from '@/types'

const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const isIAssetMarkets = computed(() =>
  (jsonStore.helixMarketCategoriesMap.iAssets || []).includes(
    props.market.marketId
  )
)
</script>

<template>
  <div class="flex">
    <NuxtLink
      v-if="isIAssetMarkets"
      target="_blank"
      to="https://injective.com/iAssets_Paper.pdf"
      class="text-2xs bg-ocean-500 bg-opacity-20 px-1 py-0.5 font-semibold rounded text-ocean-500 hover:bg-opacity-40 hover:text-opacity-80"
    >
      {{ $t('markets.iAsset') }}
    </NuxtLink>
  </div>
</template>
