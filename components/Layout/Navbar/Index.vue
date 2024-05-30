<script setup lang="ts">
import { MainPage } from '@/types'

const walletStore = useWalletStore()
const route = useRoute()
</script>

<template>
  <header class="w-full z-50 bg-brand-900 relative">
    <div class="flex border-b">
      <NuxtLink to="/" class="px-6 border-r flex justify-center items-center">
        <AssetLogo class="h-6 w-10 lg:h-10 lg:w-10 aspect-square" alt="Helix" />
      </NuxtLink>
      <LayoutNavbarMenu />

      <div class="flex-1" />

      <LayoutNavbarMenuWallet />
      <LayoutNavbarMobileMenu />
    </div>
    <div
      v-if="route.name !== MainPage.Index && walletStore.autoSign"
      class="absolute top-[57px] right-4 w-[80px] h-[20px] rounded-bl-[4px] rounded-br-[4px] bg-[#0EE29B] text-black font-semibold leading-3 text-[10px] flex justify-center items-center space-x-1"
    >
      <div>
        {{ $t('portfolio.settings.autoSign.titleWithoutHyphen') }}
      </div>

      <SharedIcon name="circle-check-border" class="w-3 h-3" />
    </div>
  </header>
</template>
