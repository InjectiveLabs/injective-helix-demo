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

  Promise.all([authZStore.fetchGrants(), gridStrategyStore.fetchStrategies()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onWalletConnected(() => {
  accountStore.streamBankBalance()
  accountStore.streamSubaccountBalance()
})
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
