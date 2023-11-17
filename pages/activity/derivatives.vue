<script lang="ts" setup>
import { ActivitySubPage } from '@/types'

const derivativeStore = useDerivativeStore()
const route = useRoute()

const { t } = useLang()

const tabs = [
  {
    label: t('activity.openOrders'),
    value: ActivitySubPage.Derivatives
  },
  {
    label: t('activity.triggers'),
    value: ActivitySubPage.DerivativesTriggers
  },
  {
    label: t('activity.orderHistory'),
    value: ActivitySubPage.DerivativesOrderHistory
  },
  {
    label: t('activity.tradeHistory'),
    value: ActivitySubPage.DerivativesTradeHistory
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
              route.name !== ActivitySubPage.Derivatives &&
              tab.value === ActivitySubPage.Derivatives
            "
            class="ml-1"
          >
            ({{ derivativeStore.subaccountOrders.length }})
          </span>

          <span
            v-if="
              route.name !== ActivitySubPage.DerivativesTriggers &&
              tab.value === ActivitySubPage.DerivativesTriggers
            "
            class="ml-1"
          >
            ({{ derivativeStore.subaccountConditionalOrdersCount }})
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
  </div>
</template>
