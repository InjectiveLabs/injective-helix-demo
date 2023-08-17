<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiMarketWithToken } from '@/types'

definePageMeta({
  middleware: ['markets', 'grid-strategy']
})

const authZStore = useAuthZStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() => gridStrategyStore.spotMarket)

function onLoad(pageMarket: UiMarketWithToken) {
  Promise.all([
    spotStore.streamTrades(pageMarket.marketId),
    spotStore.streamOrderbookUpdate(pageMarket.marketId)
  ]).catch($onError)

  gridStrategyStore.$patch({
    spotMarket: pageMarket as UiSpotMarketWithToken
  })

  fetchData()
}

onMounted(() => {
  fetchData()
})

onWalletConnected(() => {
  status.setLoading()

  Promise.all([
    gridStrategyStore.fetchStrategies(),
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function fetchData() {
  Promise.all([
    authZStore.fetchGrants(),
    gridStrategyStore.fetchStrategies(),
    accountStore.fetchAccountPortfolio(),
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <PartialsTradingLayout is-spot is-grid @loaded="onLoad">
    <template #trading-form>
      <PartialsGridStrategySpotForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsGridStrategySpotStrategies
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        v-bind="{
          market,
          status
        }"
      />
    </template>
  </PartialsTradingLayout>
</template>
