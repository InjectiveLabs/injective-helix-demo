<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { UiMarketWithToken, TradingInterface } from '@/types'

defineProps({
  isTradingBotTab: Boolean,

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
            params: { slug: market.slug },
            ...(isTradingBotTab
              ? {
                  query: {
                    interface: TradingInterface.TradingBots
                  }
                }
              : {})
          }
        : {
            name: `${
              market.type === SharedMarketType.Spot ? 'spot' : 'futures'
            }`,
            query: {
              marketId: market.marketId,
              ...(isTradingBotTab
                ? {
                    interface: TradingInterface.TradingBots
                  }
                : {})
            }
          }
    "
  >
    <slot />
  </NuxtLink>
</template>
