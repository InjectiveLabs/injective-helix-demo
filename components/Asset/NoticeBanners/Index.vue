<script setup lang="ts">
import { VITE_BANNER_NOTICE_ENABLED as showBanner } from '@/app/utils/constants/setup'
import { NoticeBanner, NoticeBannerType } from '@/types'

const appStore = useAppStore()

const banners: NoticeBannerType[] = [
  {
    key: NoticeBanner.sheduledUpgradeMarch,
    label:
      "There is a scheduled maintenance between 14-16 March. Please note that you won't be able to place orders and manage positions during the downtime.",
    viewMore: 'View More',
    viewMoreLink: '/#'
  }
]

const filteredBanners = computed(() =>
  banners.filter(
    (banner) => !appStore.userState.noticeBannersClosed.includes(banner.key)
  )
)
</script>

<template>
  <div v-if="showBanner">
    <AssetNoticeBanner
      v-for="banner in filteredBanners"
      :key="`banner-${banner.key}`"
      v-bind="{ noticeBanner: banner }"
    />
  </div>
</template>
