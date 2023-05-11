<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="flex space-x-4 mb-4">
    <PartialsActivityCommonLinkTab
      is-index
      v-bind="{
        to: {
          name: 'activity-spot'
        }
      }"
    >
      {{ $t('activity.openOrders') }} ({{ spotStore.subaccountOrdersCount }})
    </PartialsActivityCommonLinkTab>

    <CommonSeparator />

    <PartialsActivityCommonLinkTab
      v-bind="{
        to: {
          name: 'activity-spot-order-history'
        }
      }"
    >
      {{ $t('activity.orderHistory') }}
    </PartialsActivityCommonLinkTab>

    <CommonSeparator />

    <PartialsActivityCommonLinkTab
      v-bind="{
        to: {
          name: 'activity-spot-trade-history'
        }
      }"
    >
      {{ $t('activity.tradeHistory') }}
    </PartialsActivityCommonLinkTab>
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
