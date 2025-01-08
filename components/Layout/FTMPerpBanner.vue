<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const route = useRoute()

const isBannerVisible = ref(true)

const isShowBanner = computed(() => {
  if (!isBannerVisible.value) {
    return
  }

  const FTM_USDT_PERP_SLUG = 'ftm-usdt-perp'
  const FTM_USDT_PERP_MARKET_ID =
    '0x4be4791338907626dd77a806c6e4dff76d1428768080fe232f32ef990c8d064f'

  return (
    FTM_USDT_PERP_SLUG === route.params.slug ||
    FTM_USDT_PERP_MARKET_ID === route.query.marketId
  )
})

function hideBanner() {
  isBannerVisible.value = false
}
</script>

<template>
  <div
    v-if="isShowBanner"
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm justify-between relative z-40"
  >
    <div class="flex items-center space-x-2">
      {{ $t('trade.ftmMarketBanner.settleMarket') }}
    </div>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="hideBanner"
    />
  </div>
</template>
