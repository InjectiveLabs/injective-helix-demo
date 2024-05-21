<script setup lang="ts">
import { DEPOSIT_MENU_ITEM, PORTFOLIO_MENU_ITEM } from '@/app/data/menu'

const walletStore = useWalletStore()
</script>

<template>
  <div class="flex items-center p-2 space-x-2">
    <LayoutNavbarMenuItem
      class="hidden lg:block"
      v-bind="{ item: DEPOSIT_MENU_ITEM }"
    />

    <LayoutNavbarMenuItem
      v-if="walletStore.isUserWalletConnected"
      class="hidden lg:block"
      v-bind="{ item: PORTFOLIO_MENU_ITEM }"
    />

    <LayoutWallet />
  </div>
</template>
