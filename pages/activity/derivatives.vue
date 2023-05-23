<script setup lang="ts">
import { ActivityPage } from '@/types'

const derivativeStore = useDerivativeStore()
const route = useRoute()

const { t } = useLang()

const tabs = [
  {
    label: t('activity.openOrders'),
    value: ActivityPage.DerivativeOpenOrders
  },
  {
    label: t('activity.triggers'),
    value: ActivityPage.DerivativeTriggers
  },
  {
    label: t('activity.orderHistory'),
    value: ActivityPage.DerivativeOrderHistory
  },
  {
    label: t('activity.tradeHistory'),
    value: ActivityPage.DerivativeTradeHistory
  }
]
</script>

<template>
  <div>
    <div class="flex space-x-4 flex-wrap mb-4">
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
              route.name !== ActivityPage.DerivativeOpenOrders &&
              tab.value === ActivityPage.DerivativeOpenOrders
            "
            class="ml-1"
          >
            ({{ derivativeStore.subaccountOrders.length }})
          </span>

          <span
            v-if="
              route.name !== ActivityPage.DerivativeTriggers &&
              tab.value === ActivityPage.DerivativeTriggers
            "
            class="ml-1"
          >
            ({{ derivativeStore.subaccountConditionalOrdersCount }})
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
  </div>
</template>
