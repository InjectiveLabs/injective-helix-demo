<script lang="ts" setup>
import { ActivitySubPage } from '@/types'

const { t } = useLang()

const tabs = [
  {
    label: t('walletHistory.transfers.transfers'),
    value: ActivitySubPage.WalletHistory
  }
]
</script>

<template>
  <div>
    <div class="flex space-x-4 mb-4">
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
        </PartialsActivityCommonLinkTab>
      </template>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard is-md class="h-full-flex space-y-4">
        <div class="h-full-flex space-y-4">
          <PartialsActivityCommonToolbar />

          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </div>
</template>
