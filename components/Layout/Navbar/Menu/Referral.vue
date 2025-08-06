<script setup lang="ts">
import { REFERRAL_ITEM } from '@/app/data/menu'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="flex items-center">
    <LayoutNavbarMenuItem
      v-if="!appStore.isCountryRestricted"
      class="hidden xl:block px-4"
      v-bind="{ item: REFERRAL_ITEM }"
      :class="{ 'px-8': sharedWalletStore.isUserConnected }"
    />

    <LayoutWallet />
  </div>
</template>
