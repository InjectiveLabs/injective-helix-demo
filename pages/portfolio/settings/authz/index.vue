<script setup lang="ts">
const authZStore = useAuthZStore()
const gridStrategyStore = useGridStrategyStore()

const authzGranteeExcludingActiveGridContracts = computed(() => {
  return authZStore.granterGrantsByAddress.filter(([address]) => {
    return !gridStrategyStore.activeStrategies.some(
      (strategy) => strategy.contractAddress === address
    )
  })
})
</script>

<template>
  <div>
    <PartialsPortfolioSettingsAuthzGranteeTableHeader />

    <div class="divide-y border-t">
      <CommonEmptyList
        v-if="authzGranteeExcludingActiveGridContracts.length === 0"
        v-bind="{ message: $t('portfolio.authZ.noGrants') }"
      />

      <template v-else>
        <PartialsPortfolioSettingsAuthzGranteeTableRow
          v-for="[grantee, grants] in authzGranteeExcludingActiveGridContracts"
          :key="grantee"
          v-bind="{ grantee, grants }"
        />
      </template>
    </div>
  </div>
</template>
