<script setup lang="ts">
import { getTopNavMenu } from '@/app/data/menu'
import { MainPage } from '@/types'

const route = useRoute()
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
  <header
    :class="[
      'w-full z-50 fixed top-0 left-0',
      route.name === MainPage.Index ? '' : 'bg-brand-900'
    ]"
  >
    <div
      :class="['flex py-3', route.name === MainPage.Index ? '' : 'border-b']"
    >
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
