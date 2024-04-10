<script setup lang="ts">
const authZStore = useAuthZStore()
</script>

<template>
  <div>
    <PartialsPortfolioSettingsAuthzGranteeTableHeader />

    <div class="divide-y border-t">
      <PartialsPortfolioSettingsAuthzGranteeTableRow
        v-for="[grantee, grants] in authZStore.granterGrantsByAddress"
        :key="grantee"
        v-bind="{ grantee, grants }"
      />
    </div>
  </div>
</template>
