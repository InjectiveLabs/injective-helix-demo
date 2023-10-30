<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const status = reactive(new Status(StatusType.Loading))

const spotStore = useSpotStore()
const gridStrategyStore = useGridStrategyStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()

function init() {
  status.setLoading()

  Promise.all([spotStore.init()])
    .then(() => {
      gridStrategyStore.$patch({
        spotMarket: spotStore.markets.find(
          (market) => market.slug === 'inj-usdt'
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
