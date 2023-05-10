<template>
  <div>
    <div class="flex mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-wallet-history'
          }
        }"
      >
        Transfers
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-wallet-history-deposits'
          }
        }"
      >
        Deposits
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-wallet-history-withdrawals'
          }
        }"
      >
        Withdrawals
      </PartialsActivityCommonLinkTab>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard md class="h-full-flex space-y-4">
        <div class="h-full-flex space-y-4">
          <PartialsActivityCommonToolbarNew />

          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </div>
</template>
