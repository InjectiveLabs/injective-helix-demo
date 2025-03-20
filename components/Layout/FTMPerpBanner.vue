<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const route = useRoute()

const isBannerVisible = ref(true)

const pairs = [
  {
    slug: 'omni-usdt-perp',
    marketId:
      '0x4d42425fc3ccd6b61b8c4ad61134ab3cf21bdae1b665317eff671cfab79f4387'
  }
]

const isShowBanner = computed(() => {
  if (!isBannerVisible.value) {
    return
  }

  return pairs.some(
    ({ marketId, slug }) =>
      slug === route.params.slug || marketId === route.query.marketId
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
    <div />
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
