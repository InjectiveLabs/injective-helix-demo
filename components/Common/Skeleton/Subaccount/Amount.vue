<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PortfolioStatusKey } from '@/types'

withDefaults(
  defineProps<{
    size?: number
    length?: number
    width?: number
    spacing?: number
  }>(),
  {
    size: 22,
    length: 5,
    width: 10,
    spacing: 4
  }
)

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
const { allCoinGeckoIdsOnPriceMap } = useTokenUsdPrice()

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)
</script>

<template>
  <div v-if="!sharedWalletStore.isUserConnected">&mdash;</div>

  <div
    v-else-if="portfolioStatus.isLoading() || !allCoinGeckoIdsOnPriceMap"
    :style="{ height: size + 'px', gap: spacing + 'px' }"
    class="flex p-1 bg-brand-800 rounded-md animate-pulse"
  >
    <div
      v-for="i in length"
      :key="i"
      class="rounded-sm animate-pulse [animation-duration:1s]"
      :style="{ animationDelay: `${i * 0.1}s`, width: `${width}px` }"
    />
  </div>

  <div v-else-if="appStore.userState.preferences.isHideBalances">******</div>

  <slot v-else />
</template>
