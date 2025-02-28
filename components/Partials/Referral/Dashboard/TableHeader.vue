<script lang="ts" setup>
import { Modal } from '@/types'

const referralStore = useReferralStore()
const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    isEmpty?: boolean
    hasReferralLink?: boolean
  }>(),
  {}
)

function referNow() {
  modalStore.openModal(Modal.CreateReferralLink)
}
</script>

<template>
  <div
    class="flex justify-between items-end w-full gap-6 max-md:flex-col max-md:items-start"
  >
    <div
      class="w-full"
      :class="{ 'flex flex-col items-center': isEmpty && !hasReferralLink }"
    >
      <h5 class="font-bold text-xl leading-none">
        {{
          hasReferralLink
            ? $t('referral.referralDetails')
            : $t('referral.startEarningToday')
        }}
      </h5>
      <p class="tracking-wide text-coolGray-450 text-sm mt-2">
        {{ $t('referral.trackYourReferrals') }}
      </p>

      <AppButton
        v-if="!hasReferralLink"
        size="lg"
        class="font-semibold tracking-wide min-w-48 mt-8 max-sm:mt-4 max-xs:w-full"
        @click="referNow"
      >
        {{ $t('referral.referNow') }}
      </AppButton>
    </div>

    <div v-if="hasReferralLink">
      <p class="tracking-wide text-xs text-coolGray-350 mb-2 uppercase">
        {{ $t('referral.affiliatedAddress') }}
      </p>
      <p
        class="text-blue-600 underline text-sm font-medium leading-none max-sm:break-all"
      >
        {{ referralStore.referralDetails?.address || '' }}
      </p>
    </div>
  </div>
</template>
