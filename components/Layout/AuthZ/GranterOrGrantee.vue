<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'

const walletStore = useWalletStore()

const props = defineProps({
  granterOrGrantee: {
    type: String,
    required: true
  }
})

const isCurrentlySelected = computed(
  () => walletStore.authZ.injectiveAddress === props.granterOrGrantee
)

/**
 * -- TODO --
 * For now, we reload the page to refetch everything on the
 * page but we should add watchers for better UX
 */
function reload() {
  window.location.reload()
}

function resetAuthZ() {
  if (!walletStore.isAuthzWalletConnected) {
    return
  }

  walletStore.resetAuthZ()
  reload()
}

function connectToGrantee() {
  walletStore.connectAuthZ(props.granterOrGrantee)
  reload()
}
</script>
<template>
  <p class="flex items-center justify-between my-1">
    <span
      class="font-mono text-2xs"
      :class="{
        'text-gray-200': !isCurrentlySelected,
        'text-blue-500': isCurrentlySelected
      }"
    >
      {{ formatWalletAddress(granterOrGrantee) }}
    </span>
    <span v-if="isCurrentlySelected">
      <SharedIcon
        name="close"
        class="text-gray-200 hover:text-blue-500 h-3 w-3"
        @click="resetAuthZ"
      />
    </span>
    <span v-else>
      <SharedIcon
        name="spy"
        class="text-gray-200 hover:text-blue-500 h-3 w-3"
        @click="connectToGrantee"
      />
    </span>
  </p>
</template>
