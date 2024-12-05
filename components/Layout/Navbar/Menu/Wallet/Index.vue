<script setup lang="ts">
import { POINTS_ITEM } from '@/app/data/menu'

const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="flex items-center px-1">
    <LayoutNavbarMenuItem
      v-if="sharedWalletStore.isUserConnected"
      class="hidden lg:block"
      v-bind="{ item: POINTS_ITEM }"
    />

    <LayoutWallet />
  </div>
</template>
