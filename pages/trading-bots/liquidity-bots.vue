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
  <div>
    <AppHocLoading v-bind="{ status }">
      <NuxtPage />
    </AppHocLoading>
  </div>
</template>
