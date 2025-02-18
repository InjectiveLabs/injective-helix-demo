<script lang="ts" setup>
withDefaults(
  defineProps<{
    hasReferralLink?: boolean
  }>(),
  {}
)

function generateLink() {
  // console.log('generateLink')
}
</script>

<template>
  <div class="flex justify-between items-center gap-4">
    <div
      class="flex flex-1 flex-col"
      :class="{ 'items-center text-center': hasReferralLink }"
    >
      <h5 class="font-semibold text-3xl">
        {{ $t('referral.dashboardTitle') }}
      </h5>
      <p class="tracking-wide text-sm mt-2">
        {{ $t('referral.dashboardSubtitle') }}
      </p>

      <AppButton
        v-if="!hasReferralLink"
        size="lg"
        class="font-semibold tracking-wide min-w-48 mt-8"
        @click="generateLink"
      >
        {{ $t('referral.generateLink') }}
      </AppButton>
    </div>

    <img
      v-if="!hasReferralLink"
      src="/images/referral/dashboard-hero.webp"
      class="h-64 max-sm:hidden"
    />
  </div>
</template>
