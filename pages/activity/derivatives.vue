<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div>
    <div class="flex space-x-4 flex-wrap mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-derivatives'
          }
        }"
      >
        Open Orders ({{ derivativeStore.subaccountOrdersCount }})
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-derivatives-triggers'
          }
        }"
      >
        Triggers ({{ derivativeStore.subaccountConditionalOrdersCount }})
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-derivatives-order-history'
          }
        }"
      >
        Order History
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-derivatives-trade-history'
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
