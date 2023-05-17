<script setup lang="ts">
import { ActivityPage } from '@/types'

const spotStore = useSpotStore()
const route = useRoute()

const { t } = useLang()

const tabs = [
  {
    label: t('activity.openOrders'),
    value: ActivityPage.SpotOpenOrders
  },
  {
    label: t('activity.orderHistory'),
    value: ActivityPage.SpotOrderHistory
  },
  {
    label: t('activity.tradeHistory'),
    value: ActivityPage.SpotTradeHistory
  }
]
</script>

<template>
  <div class="flex space-x-4 mb-4">
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
            route.name !== ActivityPage.SpotOpenOrders &&
            tab.value === ActivityPage.SpotOpenOrders
          "
          class="ml-1"
        >
          ({{ spotStore.subaccountOrders.length }})
        </span>
      </PartialsActivityCommonLinkTab>
    </template>
  </div>

  <div class="h-full rounded-xl overflow-y-auto">
    <CommonCard md class="h-full-flex">
      <div class="h-full-flex space-y-4">
        <PartialsActivityCommonToolbarNew />
        <NuxtPage />
      </div>
    </CommonCard>
  </div>
</template>
