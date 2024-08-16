<script lang="ts" setup>
import { BANNER_NOTICE_ENABLED } from '@/app/utils/constants/setup'
import { NoticeBanner, Banner } from '@/types'

const appStore = useAppStore()

const banners: Banner[] = [
  {
    key: NoticeBanner.scheduledUpgradeAugust2024,
    label: `banners.${NoticeBanner.scheduledUpgradeAugust2024}`,
    viewMore: 'here.',
    viewMoreLink: 'https://hub.injective.network/proposal/424'
  }
]

const filteredBanners = computed(() =>
  banners.filter(
    (banner) => !appStore.userState.bannersViewed.includes(banner.key)
  )
)
</script>

<template>
  <div v-if="BANNER_NOTICE_ENABLED">
    <AssetNoticeBannersBanner
      v-for="banner in filteredBanners"
      :key="`banner-${banner.key}`"
      v-bind="{ noticeBanner: banner }"
    />
  </div>
</template>
