<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { TradeSubPage } from '@/types'

const emit = defineEmits<{
  'banner:close': []
}>()

const router = useRouter()
const sharedWalletStore = useSharedWalletStore()

function onCloseBanner() {
  emit('banner:close')
}

function onTradeNow() {
  router.push({ name: TradeSubPage.Stocks })
}
</script>

<template>
  <div
    class="relative mt-6 bg-[linear-gradient(90deg,#1F1D49,#4C3DFF)] rounded-lg"
  >
    <img
      src="/images/iassets-banner.webp"
      class="w-24 absolute left-8 bottom-0"
    />

    <UIcon
      v-if="sharedWalletStore.isUserConnected"
      :name="NuxtUiIcons.Close"
      class="size-6 min-w-6 absolute right-3 top-3 z-[5] cursor-pointer hover:text-gray-400 transition-colors"
      @click="onCloseBanner"
    />

    <div
      class="relative z-[3] flex justify-between items-center max-sm:flex-col max-sm:items-start gap-6 sm:gap-14 lg:gap-28 py-6 pl-6 sm:pl-8 pr-6 sm:pr-14"
    >
      <div class="flex-1">
        <h2 class="text-lg lg:text-xl font-bold">
          {{ $t('banners.iAssets.title') }}
        </h2>
        <p class="max-lg:text-sm mt-3 font-medium">
          {{ $t('banners.iAssets.description') }}
        </p>
      </div>

      <AppButton
        class="max-lg:text-sm text-base py-3 border-0 font-semibold bg-[#B5CDFB] hover:bg-[#B5CDFB]/80"
        @click="onTradeNow"
      >
        {{ $t('common.tradeNow') }}
      </AppButton>
    </div>
  </div>
</template>
