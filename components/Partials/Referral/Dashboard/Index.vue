<script lang="ts" setup>
// todo fred: update with data when ready
const hasReferralLink = computed(() => true)
</script>

<template>
  <div :class="{ 'px-4': !hasReferralLink }">
    <PartialsReferralDashboardHeader v-bind="{ hasReferralLink }" />

    <PartialsReferralDashboardTutorial v-if="!hasReferralLink" />
    <PartialsReferralDashboardDetails v-else />

    <PartialsReferralDashboardTable v-bind="{ hasReferralLink }" />
  </div>
</template>
