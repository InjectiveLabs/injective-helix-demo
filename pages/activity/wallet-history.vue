<template>
  <div>
    <div class="flex space-x-4 mb-4">
      <PartialsActivityCommonLinkTab
        is-index
        v-bind="{
          to: {
            name: 'activity-wallet-history'
          }
        }"
      >
        {{ $t('walletHistory.transfers.transfers') }}
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-wallet-history-deposits'
          }
        }"
      >
        {{ $t('walletHistory.deposits') }}
      </PartialsActivityCommonLinkTab>

      <CommonSeparator />

      <PartialsActivityCommonLinkTab
        v-bind="{
          to: {
            name: 'activity-wallet-history-withdrawals'
          }
        }"
      >
        {{ $t('walletHistory.withdrawals') }}
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
