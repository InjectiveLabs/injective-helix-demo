<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from 'app/utils/constants'

definePageMeta({
  middleware: ['markets', 'grid-strategy-subaccount']
})

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
// const modalStore = useModalStore()
// const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
// const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))
// const market = computed(() => gridStrategyStore.spotMarket)

function fetchData() {
  status.setLoading()
  const marketId = gridStrategyStore.spotMarket!.marketId

  Promise.all([
    authZStore.fetchGrants(),
    spotStore.fetchTrades({ marketId }),
    spotStore.fetchOrderbook(marketId),
    accountStore.streamBankBalance(),
    gridStrategyStore.fetchStrategies(),
    exchangeStore.getMarketsHistory({
      marketIds: [gridStrategyStore.spotMarket!.marketId],
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR * 24,
      countback: 30
    }),
    accountStore.fetchAccountPortfolio(),
    accountStore.streamSubaccountBalance()
  ]).finally(() => {
    status.setIdle()
  })
}

onWalletConnected(() => {
  fetchData()
})
</script>

<template>
  <div class="flex justify-center items-start min-h-screen pt-4 md:pt-20 pb-10">
    <div class="p-6 bg-gray-900 rounded-md w-full max-w-xl">
      <AppHocLoading v-bind="{ status }">
        <p class="text-xl font-semibold text-center mb-4">
          {{ $t('liquidity.liquidityBots') }}
        </p>

        <PartialsLiquidityBotsSpotMarketSelector />

        <PartialsLiquidityBotsSpotActive v-if="false" />

        <PartialsLiquidityBotsSpotCreate />
      </AppHocLoading>
    </div>
  </div>
</template>
