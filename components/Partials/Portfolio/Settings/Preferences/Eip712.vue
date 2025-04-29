<script setup lang="ts">
const sharedWalletStore = useSharedWalletStore()

const value = computed({
  get: () => sharedWalletStore.isEip712,
  set: (value) => sharedWalletStore.$patch({ isEip712: value })
})
</script>

<template>
  <div class="p-4 flex items-center space-x-4">
    <AppSwitch v-model="value" />
    <p class="text-sm font-semibold">
      {{ $t('portfolio.settings.preferences.enableEip712') }}
    </p>
  </div>
</template>
