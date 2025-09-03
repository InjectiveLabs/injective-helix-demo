<script setup lang="ts">
import { FEATURED_NAV_ITEM } from '@/app/data/menu'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'max-lg:pr-2': !sharedWalletStore.isUserConnected }"
  >
    <LayoutNavbarMenuItem
      v-if="!appStore.isCountryRestricted"
      class="hidden lg:block px-4"
      v-bind="{ item: FEATURED_NAV_ITEM }"
      :class="{ 'px-8': sharedWalletStore.isUserConnected }"
    />

    <LayoutWallet />
  </div>
</template>
