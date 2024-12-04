<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { MainPage } from '@/types'

const route = useRoute()
const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <header class="w-full z-50 bg-brand-900 relative">
    <div class="flex border-b">
      <NuxtLink to="/" class="pl-6 pr-2 flex justify-center items-center">
        <AssetLogo class="h-6 w-8 lg:h-8 lg:w-8 aspect-square" alt="Helix" />
      </NuxtLink>

      <LayoutNavbarMenu />

      <div class="flex-1" />

      <LayoutNavbarMenuWallet />
      <LayoutNavbarMobileMenu />
    </div>

    <div
      v-if="
        route.name !== MainPage.Index && sharedWalletStore.isAutoSignEnabled
      "
      class="absolute top-[57px] right-4 w-[80px] h-[20px] rounded-bl-[4px] rounded-br-[4px] bg-[#0EE29B] text-black font-semibold leading-3 text-[10px] flex justify-center items-center space-x-1"
    >
      <div>
        {{ $t('portfolio.settings.autoSign.titleWithoutHyphen') }}
      </div>
      <UIcon :name="NuxtUiIcons.CheckmarkOutline" class="w-4 h-4" />
    </div>
  </header>
</template>
