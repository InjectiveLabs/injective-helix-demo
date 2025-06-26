<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    hasReferralLink?: boolean
  }>(),
  {}
)

function referAndEarn() {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  modalStore.openModal(Modal.CreateReferralLink)
}
</script>

<template>
  <div class="flex justify-between items-center gap-4">
    <div
      class="flex flex-1 flex-col"
      :class="{
        'items-center text-center max-sm:items-start max-sm:text-left':
          hasReferralLink
      }"
    >
      <h5 class="font-semibold text-3xl max-sm:max-w-52 leading-tight">
        {{ $t('referral.dashboardTitle') }}
      </h5>
      <p class="tracking-wide text-sm mt-3 max-sm:max-w-56 max-sm:mt-7">
        {{ $t('referral.dashboardSubtitle') }}
      </p>

      <AppButton
        v-if="!hasReferralLink"
        size="lg"
        :disabled="!sharedWalletStore.isUserConnected"
        class="font-semibold tracking-wide min-w-48 mt-8 max-xs:w-full"
        @click="referAndEarn"
      >
        {{ $t('referral.referAndEarn') }}
      </AppButton>
    </div>

    <img
      v-if="!hasReferralLink"
      src="/images/referral/dashboard-hero.webp"
      class="h-64 max-md:hidden"
    />
  </div>
</template>
