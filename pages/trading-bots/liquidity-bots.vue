<script lang="ts" setup>
import { MainPage } from '@/types'

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const sharedWalletStore = useSharedWalletStore()

const marketSlugQuery = useQueryRef('market', 'tia-usdt')

onMounted(() => {
  init()
})

function init() {
  gridStrategyStore.$patch({
    spotMarket: spotStore.markets.find(
      (market) => market.slug === marketSlugQuery.value
    )
  })

  if (sharedWalletStore.isUserConnected) {
    accountStore.$patch({ subaccountId: sharedWalletStore.defaultSubaccountId })
  }
}

onUnmounted(() => {
  spotStore.reset()
})
</script>

<template>
  <div class="min-h-screen pt-4 md:pt-10 pb-10">
    <div class="w-full max-w-xl mx-auto">
      <div class="my-2 flex flex-wrap">
        <NuxtLink
          :to="{ name: MainPage.TradingBotsLiquidityBotsSpot }"
          active-class="underline"
          class="text-lg font-semibold"
        >
          {{ $t('liquidity.liveBots') }}
        </NuxtLink>

        <NuxtLink
          v-if="sharedWalletStore.isUserConnected"
          :to="{ name: MainPage.TradingBotsLiquidityBotsSpotHistory }"
          active-class="underline"
          class="text-lg font-semibold ml-4"
        >
          {{ $t('liquidity.history') }}
        </NuxtLink>

        <NuxtLink
          :to="{ name: MainPage.LpRewards }"
          active-class="underline"
          class="text-lg font-semibold ml-auto"
        >
          <span>{{ $t('liquidity.rewards') }}</span>
        </NuxtLink>
      </div>

      <div class="p-6 border-brand-800 border rounded-md">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
