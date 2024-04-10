<script setup lang="ts">
const walletStore = useWalletStore()
</script>

<template>
  <div class="bg-[#5B5B5F] flex items-center justify-between p-2">
    <div class="flex items-center space-x-2">
      <BaseIcon name="show" />
      <p class="text-xs">
        Connected As {{ walletStore.authZOrInjectiveAddress }}
      </p>
    </div>
    <AppButton
      variant="danger"
      size="xs"
      class="bg-white text-black hover:text-black hover:bg-gray-300"
      @click="walletStore.resetAuthZ()"
    >
      Disconnect
    </AppButton>
  </div>
</template>
