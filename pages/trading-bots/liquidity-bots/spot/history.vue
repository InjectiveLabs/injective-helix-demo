<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { MainPage } from '@/types'

const router = useRouter()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const active = ref('')
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
        />
      </div>

      <div v-if="gridStrategyStore.removedStrategies.length === 0">
        <CommonEmptyList
          class="bg-black rounded-md p-4 my-4"
          v-bind="{ message: $t('liquidity.noStrategiesFound') }"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
