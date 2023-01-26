<script lang="ts" setup>
defineProps({
  breakMd: Boolean
})

const walletStore = useWalletStore()
</script>

<template>
  <div
    class="min-h-orders flex-col h-full overflow-y-auto bg-gray-1000 flex-grow"
    :class="{
      'md:min-h-0 md:flex': breakMd,
      'min-h-0 max-h-lg flex': !breakMd
    }"
  >
    <CommonUserNotConnectedNote
      v-if="!walletStore.isUserWalletConnected"
      class="bg-gray-1000"
    />
    <slot v-else />
  </div>
</template>
