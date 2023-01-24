<script lang="ts" setup>
import { REFERRALS_ENABLED } from '@/app/utils/constants'
import { getReferralUrl } from '@/app/utils/helpers'

const referralStore = useReferralStore()

const refereeInfo = computed(() => {
  return referralStore.refereeInfo
})

const referrerInfo = computed(() => {
  return referralStore.referrerInfo
})

const referralCode = computed(() => {
  if (!refereeInfo.value && !referrerInfo.value) {
    return undefined
  }

  return refereeInfo.value?.referralCode || referrerInfo.value?.referralCode
})

const showReferralCode = computed(() => {
  return REFERRALS_ENABLED && referralCode.value
})

const referralDashboardLink = computed(() => {
  return getReferralUrl()
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
