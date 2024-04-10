<script setup lang="ts">
const authZStore = useAuthZStore()
</script>

<template>
  <div>
    <PartialsPortfolioSettingsAuthzGranterTableHeader />

    <div class="divide-y border-y">
      <PartialsPortfolioSettingsAuthzGranterTableRow
        v-for="[granter, grants] in authZStore.granteeGrantsByAddress"
        :key="granter"
        v-bind="{ granter, grants }"
      />
    </div>
  </div>
</template>
