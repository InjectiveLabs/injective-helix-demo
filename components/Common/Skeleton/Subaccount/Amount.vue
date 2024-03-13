import { portfolioStatusKey } from '~/types'; import { portfolioStatusKey } from
'~/types';
<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { portfolioStatusKey, tokensStatusKey } from '@/types'

defineProps({
  size: {
    type: Number,
    default: 22
  },

  length: {
    type: Number,
    default: 5
  },

  width: {
    type: Number,
    default: 10
  },

  spacing: {
    type: Number,
    default: 4
  }
})

const appStore = useAppStore()
const walletStore = useWalletStore()

const portfolioStatus = inject(
  portfolioStatusKey,
  new Status(StatusType.Loading)
)

const tokensStatus = inject(tokensStatusKey, new Status(StatusType.Loading))
</script>

<template>
  <div v-if="!walletStore.isUserWalletConnected">-</div>

  <div
    v-else-if="portfolioStatus.isLoading() || tokensStatus.isLoading()"
    :style="{ height: size + 'px', gap: spacing + 'px' }"
    class="flex p-1 bg-brand-850 rounded-md animate-pulse"
  >
    <div
      v-for="i in length"
      :key="i"
      class="bg-gray-700 rounded-sm animate-pulse [animation-duration:1s]"
      :style="{ animationDelay: `${i * 0.1}s`, width: `${width}px` }"
    />
  </div>

  <div v-else-if="appStore.userState.preferences.isHideBalances">******</div>

  <slot v-else />
</template>
