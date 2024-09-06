<script setup lang="ts">
import { getDepositMenuItem, PORTFOLIO_MENU_ITEM } from '@/app/data/menu'

const sharedWalletStore = useSharedWalletStore()

const depositMenuItem = getDepositMenuItem()
</script>

<template>
  <div class="flex items-center p-2 lg:space-x-2">
    <LayoutNavbarMenuItem
      class="hidden lg:block"
      v-bind="{ item: depositMenuItem }"
    />

    <LayoutNavbarMenuItem
      v-if="sharedWalletStore.isUserConnected"
      class="hidden lg:block"
      v-bind="{ item: PORTFOLIO_MENU_ITEM }"
    />

    <LayoutWallet />
  </div>
</template>
