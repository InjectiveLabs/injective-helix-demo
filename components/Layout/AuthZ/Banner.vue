<script setup lang="ts">
const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="bg-blue-400 text-blue-900 flex items-center justify-between p-2">
    <div class="flex items-center space-x-2">
      <SharedIcon name="show" />
      <p class="text-xs">
        {{ $t('connect.connectedAs') }}
        <strong>{{ sharedWalletStore.authZOrInjectiveAddress }}</strong>
      </p>
    </div>

    <div class="px-4">
      <SharedIcon
        name="exit"
        class="text-blue-900"
        @click="sharedWalletStore.resetAuthZ()"
      />
    </div>
  </div>
</template>
