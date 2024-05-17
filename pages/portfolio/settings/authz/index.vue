<script setup lang="ts">
const authZStore = useAuthZStore()
</script>

<template>
  <div>
    <PartialsPortfolioSettingsAuthzGranteeTableHeader />

    <div class="divide-y border-t">
      <CommonEmptyList
        v-if="authZStore.granterGrantsByAddress.length === 0"
        v-bind="{ message: $t('portfolio.settings.authz.noGrants') }"
      />

      <template v-else>
        <PartialsPortfolioSettingsAuthzGranteeTableRow
          v-for="[grantee, grants] in authZStore.granterGrantsByAddress"
          :key="grantee"
          v-bind="{ grantee, grants }"
        />
      </template>
    </div>
  </div>
</template>
