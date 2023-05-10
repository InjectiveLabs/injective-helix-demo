<script setup lang="ts">
const positionStore = usePositionStore()
</script>

<template>
  <div>
    <div class="flex mb-4 gap-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-positions'
          }
        }"
      >
        <span>
          {{ $t('activity.openPositions') }}
        </span>
        <span id="activity-position-tab-count-default">
          ({{ positionStore.subaccountPositionsCount }})
        </span>
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-positions-funding-payments'
          }
        }"
      >
        {{ $t('activity.fundingPayments') }}
      </PartialsActivityCommonLinkTab>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard md class="h-full-flex space-y-4">
        <PartialsActivityCommonToolbarNew />

        <div class="h-full-flex">
          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </div>
</template>
