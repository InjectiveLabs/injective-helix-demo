<script lang="ts" setup>
import { MainPage } from '@/types'

const spotStore = useSpotStore()

const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

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

  if (walletStore.isUserWalletConnected) {
    accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
  }
}

onUnmounted(() => {
  spotStore.reset()
})
</script>

<template>
  <div class="min-h-screen pt-4 md:pt-10 pb-10">
    <div class="w-full max-w-xl mx-auto">
      <div class="space-x-4 my-2">
        <NuxtLink
          :to="{ name: MainPage.TradingBotsLiquidityBotsSpot }"
          active-class="underline"
          class="text-xl font-semibold"
        >
          {{ $t('liquidity.liveBots') }}
        </NuxtLink>

        <NuxtLink
          v-if="walletStore.isUserWalletConnected"
          :to="{ name: MainPage.TradingBotsLiquidityBotsSpotHistory }"
          active-class="underline"
          class="text-xl font-semibold"
        >
          {{ $t('liquidity.history') }}
        </NuxtLink>
      </div>

      <div class="p-6 border-brand-800 border rounded-md">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
