<script lang="ts" setup>
const referralStore = useReferralStore()
</script>

<template>
  <div :class="{ 'sm:px-4': !referralStore.isReferrer }">
    <PartialsReferralDashboardHeader
      v-bind="{ hasReferralLink: referralStore.isReferrer }"
    />

    <PartialsReferralDashboardTutorial v-if="!referralStore.isReferrer" />
    <PartialsReferralDashboardDetails v-else />

    <PartialsReferralDashboardTable
      v-bind="{ hasReferralLink: referralStore.isReferrer }"
    />
  </div>
</template>
