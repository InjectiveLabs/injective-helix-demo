<script lang="ts" setup>
import { REFERRALS_ENABLED } from '@/app/utils/constants'
import { getReferralUrl } from '@/app/utils/helpers'

const referralStore = useReferralStore()

const referralDashboardLink = getReferralUrl()

const refereeInfo = computed(() => referralStore.refereeInfo)
const referrerInfo = computed(() => referralStore.referrerInfo)
const showReferralCode = computed(() => REFERRALS_ENABLED && referralCode.value)

const referralCode = computed(() => {
  if (!refereeInfo.value && !referrerInfo.value) {
    return undefined
  }

  return refereeInfo.value?.referralCode || referrerInfo.value?.referralCode
})
</script>

<template>
  <div
    v-if="showReferralCode"
    class="flex items-center justify-between text-xs"
  >
    <span class="font-semibold">
      {{ $t(refereeInfo ? 'navigation.referral' : 'navigation.referralCode') }}
    </span>

    <NuxtLink
      :to="referralDashboardLink"
      target="_blank"
      class="text-green-500 hover:opacity-80 flex items-center gap-2 tracking-wide"
    >
      <span>
        {{ referralCode }}
      </span>
      <BaseIcon name="external-link-arrow" xs />
    </NuxtLink>
  </div>
</template>
