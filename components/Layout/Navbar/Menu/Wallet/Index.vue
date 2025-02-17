<script setup lang="ts">
import { POINTS_ITEM } from '@/app/data/menu'

const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="flex items-center px-1">
    <LayoutNavbarMenuItem
      class="hidden lg:block px-4"
      :class="{ 'px-8': sharedWalletStore.isUserConnected }"
      v-bind="{ item: POINTS_ITEM }"
    />

    <LayoutWallet />
  </div>
</template>
