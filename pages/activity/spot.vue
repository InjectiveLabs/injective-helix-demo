<script setup lang="ts">
import { ActivitySubPage } from '@/types'

const spotStore = useSpotStore()
const route = useRoute()

const { t } = useLang()

const tabs = [
  {
    label: t('activity.openOrders'),
    value: ActivitySubPage.Spot
  },
  {
    label: t('activity.orderHistory'),
    value: ActivitySubPage.SpotOrderHistory
  },
  {
    label: t('activity.tradeHistory'),
    value: ActivitySubPage.SpotTradeHistory
  },
  {
    label: t('activity.swapHistory'),
    value: ActivitySubPage.SpotSwapHistory
  }
]
</script>

<template>
  <div class="flex space-x-4 mb-4 flex-wrap">
    <template v-for="(tab, index) in tabs" :key="`subtab-${tab.label}`">
      <CommonSeparator v-if="index !== 0" />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: tab.value
          }
        }"
      >
        <span>{{ tab.label }}</span>
        <span :id="tab.value" />

        <span
          v-if="
            route.name !== ActivitySubPage.Spot &&
            tab.value === ActivitySubPage.Spot
          "
          class="ml-1"
        >
          ({{ spotStore.subaccountOrders.length }})
        </span>
      </PartialsActivityCommonLinkTab>
    </template>
  </div>

  <div class="h-full rounded-xl overflow-y-auto">
    <CommonCard is-md class="h-full-flex">
      <div class="h-full-flex space-y-4">
        <PartialsActivityCommonToolbar />
        <NuxtPage />
      </div>
    </CommonCard>
  </div>
</template>
