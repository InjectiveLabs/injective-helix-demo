<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PortfolioStatusKey } from '@/types'

withDefaults(
  defineProps<{
    size?: number
    width?: number
    length?: number
    spacing?: number
  }>(),
  {
    size: 22,
    width: 10,
    length: 5,
    spacing: 4
  }
)

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)
</script>

<template>
  <div v-if="!sharedWalletStore.isUserConnected">&mdash;</div>

  <div
    v-else-if="portfolioStatus.isLoading()"
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
