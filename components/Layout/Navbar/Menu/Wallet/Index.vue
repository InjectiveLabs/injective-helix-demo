<script setup lang="ts">
import { REFERRAL_ITEM } from '@/app/data/menu'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="flex items-center max-lg:pr-2">
    <LayoutNavbarMenuItem
      v-if="!appStore.isCountryRestricted"
      class="hidden lg:block px-4"
      :class="{ 'px-8': sharedWalletStore.isUserConnected }"
      v-bind="{ item: REFERRAL_ITEM }"
    />

    <LayoutWallet />
  </div>
</template>
