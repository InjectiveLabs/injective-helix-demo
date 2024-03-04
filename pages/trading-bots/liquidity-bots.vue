<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { MainPage } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const marketSlugQuery = useQueryRef('market', 'tia-usdt')

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  init()
})

function init() {
  status.setLoading()

  Promise.all([
    spotStore.init(),
    tokenStore.getTokensUsdPriceMapFromToken(tokenStore.tokens)
  ])
    .then(() => {
      gridStrategyStore.$patch({
        spotMarket: spotStore.markets.find(
          (market) => market.slug === marketSlugQuery.value
        )
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      if (walletStore.isUserWalletConnected) {
        accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
      }
    })
}

onUnmounted(() => {
  spotStore.reset()
})
</script>

<template>
  <div class="min-h-screen pt-4 md:pt-10 pb-10">
    <div class="w-full max-w-xl mx-auto">
      <div class="pb-10">
        <PartialsLiquidityBotsSpotCreateCommonTiaBanner />
      </div>

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

      <AppHocLoading v-bind="{ status }">
        <div class="p-6 bg-brand-875 border-brand-800 border rounded-md">
          <NuxtPage />
        </div>
      </AppHocLoading>
    </div>
  </div>
</template>
