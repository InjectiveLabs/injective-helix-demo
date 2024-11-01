<script setup lang="ts">
const { t } = useLang()

const options = [
  {
    label: t('sgt.tabs.liveSpotGrid'),
    to: '/portfolio/orders/spot-grid'
  },
  {
    label: t('sgt.tabs.spotGridHistory'),
    to: '/portfolio/orders/spot-grid/history'
  }
]
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('tradingBots.spotGrid') }}</h3>
    </div>

    <div class="flex">
      <NuxtLink
        v-for="option in options"
        :key="option.label"
        :to="option.to"
        class="p-4 text-coolGray-400 font-medium"
        exact-active-class="text-white"
      >
        {{ option.label }}
      </NuxtLink>
    </div>

    <div>
      <NuxtPage />
    </div>
  </div>
</template>
