<template>
  <div>
    <div class="flex mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-derivatives'
          }
        }"
      >
        Open Orders
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-derivatives-triggers'
          }
        }"
      >
        Triggers
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
        <div class="h-full-flex">
          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </div>
</template>
