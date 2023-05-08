<template>
  <div>
    <div class="flex mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-positions'
          }
        }"
      >
        Open Positions
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-positions-funding-payments'
          }
        }"
      >
        Funding Payments
      </PartialsActivityCommonLinkTab>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard md class="h-full-flex">
        <div class="h-full-flex">
          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </div>
</template>
