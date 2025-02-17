<script setup lang="ts">
const authZStore = useAuthZStore()
</script>

<template>
  <div>
    <PartialsPortfolioSettingsAuthzGranterTableHeader />

    <div class="divide-y border-y overflow-x-auto">
      <CommonEmptyList
        v-if="authZStore.granteeGrantsByAddress.length === 0"
        v-bind="{ message: $t('portfolio.settings.authz.noGrants') }"
      />

      <template v-else>
        <PartialsPortfolioSettingsAuthzGranterTableRow
          v-for="[granter, grants] in authZStore.granteeGrantsByAddress"
          :key="granter"
          v-bind="{ granter, grants }"
        />
      </template>
    </div>
  </div>
</template>
