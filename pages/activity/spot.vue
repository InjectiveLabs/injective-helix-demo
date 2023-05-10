<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div>
    <div class="flex mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-spot'
          }
        }"
      >
        Open Orders ({{ spotStore.subaccountOrdersCount }})
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-spot-order-history'
          }
        }"
      >
        Order History
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-spot-trade-history'
          }
        }"
      >
        Trade History
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
  </div>
</template>
