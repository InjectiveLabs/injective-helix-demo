<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, MainPage, UiSpotMarket } from '@/types'

const router = useRouter()
const modalStore = useModalStore()
const walletStore = useSharedWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const active = ref('')
const selectedMarket = ref<UiSpotMarket>()
const selectedStrategy = ref<TradingStrategy>()
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  status.setLoading()

  Promise.all([
    accountStore.fetchCw20Balances(),
    accountStore.fetchAccountPortfolioBalances(),
    gridStrategyStore.fetchAllStrategies()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

watch(
  () => walletStore.isUserConnected,
  (isConnected) => {
    if (!isConnected) {
      router.replace({ name: MainPage.TradingBotsLiquidityBotsSpot })
    }
  },
  { immediate: true }
)

function setMarketAndStrategy(strategy: TradingStrategy, market: UiSpotMarket) {
  selectedMarket.value = market
  selectedStrategy.value = strategy

  modalStore.openModal(Modal.GridStrategyDetails)
}
</script>

<template>
  <div>
    <h3 class="text-xl font-semibold text-center">
      {{ $t('liquidity.history') }}
    </h3>

    <AppHocLoading v-bind="{ status }">
      <div>
        <PartialsLiquidityBotsSpotHistoryRow
          v-for="(strategy, index) in gridStrategyStore.removedStrategies"
          :key="`strategy-${strategy.createdHeight}-${strategy.createdAt}`"
          v-model="active"
          v-bind="{ strategy, value: index.toString() }"
          @details:open="setMarketAndStrategy"
        />
      </div>

      <div v-if="gridStrategyStore.removedStrategies.length === 0">
        <CommonEmptyList
          class="bg-black rounded-md p-4 my-4"
          v-bind="{ message: $t('liquidity.noStrategiesFound') }"
        />
      </div>
    </AppHocLoading>

    <ModalsLiquidityGridStrategyDetails
      v-bind="{ market: selectedMarket, strategy: selectedStrategy }"
    />
  </div>
</template>
