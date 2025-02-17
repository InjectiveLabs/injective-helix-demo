<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const route = useRoute()

const isBannerVisible = ref(true)

const pairs = [
  {
    slug: 'btc-wusdm-perp',
    marketId:
      '0x0d4c722badb032f14dfc07355258a4bcbd354cbc5d79cb5b69ddd52b1eb2f709'
  },
  {
    slug: 'moodeng-usdt-perp',
    marketId:
      '0x65bba95527630a9648d808ebe0e7b6e0c47d1ba0283a396bd5335e4d1997d85f'
  },
  {
    slug: 'chillguy-usdt-perp',
    marketId:
      '0x26e978947835ce9d686d5345dec98e2c356aa17b371886dfb5a05e9bafbd89e8'
  },
  {
    slug: 'ftm-usdt-perp',
    marketId:
      '0x4be4791338907626dd77a806c6e4dff76d1428768080fe232f32ef990c8d064f'
  },
  {
    slug: 'jup-usdt-perp',
    marketId:
      '0x03841e74624fd885d1ee28453f921d18c211e78a0d7646c792c7903054eb152c'
  },
  {
    slug: 'popcat-usdt-perp',
    marketId:
      '0x8157dd4bf502fc688aaa722c725124da3f411d7a92c569d55f34826f9ee040a9'
  },
  {
    slug: 'mother-usdt-perp',
    marketId:
      '0xa9ff3263c6a23bd1effb92f663bd8a1c9f9fa25f83f02c45364f92d77473827b'
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
