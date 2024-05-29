<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <NuxtLink
    :to="
      market.isVerified
        ? {
            name: `${
              market.type === SharedMarketType.Spot ? 'spot' : 'futures'
            }-slug`,
            params: { slug: market.slug }
          }
        : {
            name: `${
              market.type === SharedMarketType.Spot ? 'spot' : 'futures'
            }`,
            query: { marketId: market.marketId }
          }
    "
  >
    <slot />
  </NuxtLink>
</template>
