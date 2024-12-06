<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import {
  TradePage,
  TradeSubPage,
  UiMarketWithToken,
  TradingInterface
} from '@/types'

withDefaults(
  defineProps<{
    isTradingBotTab?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)
</script>

<template>
  <NuxtLink
    :to="
      market.isVerified
        ? {
            name:
              market.type === SharedMarketType.Spot
                ? TradeSubPage.Spot
                : TradeSubPage.Futures,
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
              market.type === SharedMarketType.Spot
                ? TradePage.Spot
                : TradePage.Futures
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
