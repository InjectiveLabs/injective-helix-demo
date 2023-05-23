<script setup lang="ts">
import { ActivityPage } from '@/types'

const positionStore = usePositionStore()
const route = useRoute()

const { t } = useLang()

const tabs = [
  {
    label: t('activity.openPositions'),
    value: ActivityPage.OpenPositions
  },
  {
    label: t('activity.fundingPayments'),
    value: ActivityPage.FundingPayments
  }
]
</script>

<template>
  <div class="flex mb-4 gap-4">
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
            route.name !== ActivityPage.OpenPositions &&
            tab.value === ActivityPage.OpenPositions
          "
          class="ml-1"
        >
          ({{ positionStore.subaccountPositionsCount }})
        </span>
      </PartialsActivityCommonLinkTab>
    </template>
  </div>

  <div class="h-full rounded-xl overflow-y-auto">
    <CommonCard md class="h-full-flex space-y-4">
      <PartialsActivityCommonToolbarNew />

      <div class="h-full-flex">
        <NuxtPage />
      </div>
    </CommonCard>
  </div>
</template>
