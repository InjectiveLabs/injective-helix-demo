<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Modal, MainPage } from '@/types'

const router = useRouter()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const active = ref('')
const selectedStrategy = ref<TradingStrategy>()
const selectedMarket = ref<UiSpotMarketWithToken>()
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  status.setLoading()

  Promise.all([
    accountStore.fetchAccountPortfolio(),
    gridStrategyStore.fetchAllStrategies()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected) {
      router.replace({ name: MainPage.TradingBotsLiquidityBotsSpot })
    }
  },
  { immediate: true }
)

function setMarketAndStrategy(
  strategy: TradingStrategy,
  market: UiSpotMarketWithToken
) {
  selectedStrategy.value = strategy
  selectedMarket.value = market

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
