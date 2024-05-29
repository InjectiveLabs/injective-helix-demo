<script setup lang="ts">
const walletStore = useWalletStore()
</script>

<template>
  <div class="bg-blue-400 text-blue-900 flex items-center justify-between p-2">
    <div class="flex items-center space-x-2">
      <SharedIcon name="show" />
      <p class="text-xs">
        {{ $t('connect.connectedAs') }}
        <strong>{{ walletStore.authZOrInjectiveAddress }}</strong>
      </p>
    </div>

    <div class="px-4">
      <SharedIcon
        name="exit"
        class="text-blue-900"
        @click="walletStore.resetAuthZ()"
      />
    </div>
  </div>
</template>
