<script setup lang="ts">
import { getTopNavMenu } from '@/app/data/menu'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()

const filteredTopNavMenu = computed(() =>
  getTopNavMenu().filter((item) => {
    if (item.isDevOnly) {
      return appStore.devMode
    }

    if (item.isConnectedOnly) {
      return sharedWalletStore.isUserConnected
    }

    return true
  })
)
</script>

<template>
  <header class="w-full z-50 bg-brand-900 relative">
    <div class="flex border-b py-3">
      <NuxtLink
        to="/"
        class="pl-6 pr-4 mr-4 flex justify-center items-center cursor-pointer"
      >
        <AssetLogo class="h-6 w-8 lg:h-8 lg:w-8 aspect-square" alt="Helix" />
      </NuxtLink>

      <div class="flex space-x-4 max-lg:hidden cursor-pointer">
        <LayoutNavbarMenuItem
          v-for="(item, index) in filteredTopNavMenu"
          :key="`${item.label}-${index}`"
          :item="item"
        />
      </div>

      <div class="flex-1" />

      <LayoutNavbarMenuWallet />
      <LayoutNavbarMobileMenu />
    </div>
  </header>
</template>
