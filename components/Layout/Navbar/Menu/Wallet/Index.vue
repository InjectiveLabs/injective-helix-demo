<script setup lang="ts">
import { getDepositMenuItem, PORTFOLIO_MENU_ITEM } from '@/app/data/menu'
import { MenuItemType } from '~/types'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()

const depositMenuItem = computed(() => {
  const item = getDepositMenuItem()

  return !appStore.devMode && item.type === MenuItemType.Dropdown
    ? {
        ...item,
        items: item.items.filter(
          (item) => item.label !== 'navigation.leaderboard.title'
        )
      }
    : item
})
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
