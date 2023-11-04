<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import useQueryRef from 'composables/useQueryRef'

const status = reactive(new Status(StatusType.Loading))

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

const { $onError } = useNuxtApp()

const marketSlugQuery = useQueryRef('market', 'tia-usdt')

function init() {
  status.setLoading()

  Promise.all([
    spotStore.init(),
    tokenStore.fetchTokensUsdPriceMap(
      tokenStore.tokens.map((t) => t.coinGeckoId)
    )
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

onMounted(() => {
  init()
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
          :to="{ name: 'trading-bots-liquidity-bots-spot' }"
          active-class="underline"
          class="text-xl font-semibold"
        >
          {{ $t('liquidity.liveBots') }}
        </NuxtLink>
        <NuxtLink
          :to="{ name: 'trading-bots-liquidity-bots-spot-history' }"
          active-class="underline"
          class="text-xl font-semibold"
        >
          {{ $t('liquidity.history') }}
        </NuxtLink>
      </div>

      <AppHocLoading v-bind="{ status }">
        <div class="p-6 bg-gray-900 rounded-md">
          <NuxtPage />
        </div>
      </AppHocLoading>
    </div>
  </div>
</template>
