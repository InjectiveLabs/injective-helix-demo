<script lang="ts" setup>
defineProps({
  isBreakMd: Boolean
})

const walletStore = useWalletStore()
</script>

<template>
  <div
    class="min-h-orders flex-col h-full overflow-y-auto bg-gray-1000 flex-grow"
    :class="{
      'md:min-h-0 md:flex': isBreakMd,
      'min-h-0 flex': !isBreakMd
    }"
  >
    <CommonUserNotConnectedNote
      v-if="!walletStore.isUserWalletConnected"
      cta
      class="bg-gray-1000"
    />
    <slot v-else />
  </div>
</template>
