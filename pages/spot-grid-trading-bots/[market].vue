<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  // ActivityFetchOptions
  UiMarketWithToken
} from '@/types'

definePageMeta({
  middleware: ['markets']
})

const gridStore = useGridStore()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const market = ref<UiSpotMarketWithToken | undefined>(undefined)
const fetchStatus = reactive(new Status(StatusType.Loading))

function onLoad(pageMarket: UiMarketWithToken) {
  filterByCurrentMarket.value = false

  Promise.all([
    spotStore.streamTrades(pageMarket.marketId),
    spotStore.streamOrderbookUpdate(pageMarket.marketId)
  ]).catch($onError)

  market.value = pageMarket as UiSpotMarketWithToken

  gridStore.$patch({ marketSlug: pageMarket.slug })

  refreshSubaccountDetails()
}

function refreshSubaccountDetails() {
  if (!market.value) {
    return
  }
  fetchStatus.setLoading()

  Promise.all([gridStore.fetchStrategies(), gridStore.fetchGrants()])
    .catch($onError)
    .finally(() => {
      fetchStatus.setIdle()
    })
}

onWalletConnected(() => {
  accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
  accountStore.fetchAccountPortfolio()
  accountStore.streamBankBalance()
  accountStore.streamSubaccountBalance()
})

watch(
  () => accountStore.subaccountId,
  () => {
    if (accountStore.subaccountId !== walletStore.defaultSubaccountId) {
      accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
    }
  }
)
</script>

<template>
  <PartialsGridTradingLayout is-spot is-grid @loaded="onLoad">
    <template #trading-form>
      <PartialsGridTradingSpotForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsGridTradingSpotStrategies
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        :market="market"
        :status="fetchStatus"
      />
    </template>
  </PartialsGridTradingLayout>
</template>
