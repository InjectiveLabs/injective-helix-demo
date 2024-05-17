<script setup lang="ts">
import { MainPage, MenuItemType } from '@/types'

const walletStore = useWalletStore()
</script>

<template>
  <div class="flex p-2 space-x-2">
    <div v-if="walletStore.isUserWalletConnected" class="flex items-center">
      <LayoutNavbarMenuItem
        class="hidden lg:block"
        v-bind="{
          item: {
            label: 'portfolio',
            type: MenuItemType.Link,
            to: { name: MainPage.Portfolio }
          }
        }"
      />
    </div>

    <LayoutWallet />
  </div>
</template>
