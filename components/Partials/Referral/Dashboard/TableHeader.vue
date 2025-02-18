<script lang="ts" setup>
withDefaults(
  defineProps<{
    hasReferralLink?: boolean
  }>(),
  {}
)

const affiliatedAddress = computed(
  () => 'inj1akxycslq8cjt0uffw4rjmfm3echchptu52a3op'
)

function referNow() {
  // console.log('referNow')
}
</script>

<template>
  <div class="flex justify-between items-end w-full">
    <div>
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
        class="font-semibold tracking-wide min-w-48 mt-8"
        @click="referNow"
      >
        {{ $t('referral.referNow') }}
      </AppButton>
    </div>

    <div v-if="hasReferralLink">
      <p class="tracking-wide text-xs text-coolGray-350 mb-2 uppercase">
        {{ $t('referral.affiliatedAddress') }}
      </p>
      <p class="text-blue-600 underline text-sm font-medium leading-none">
        {{ affiliatedAddress }}
      </p>
    </div>
  </div>
</template>
