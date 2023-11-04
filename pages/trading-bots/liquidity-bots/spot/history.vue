<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

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
      router.replace({ name: 'trading-bots-liquidity-bots-spot' })
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
    </AppHocLoading>
  </div>
</template>
