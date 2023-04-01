<script setup lang="ts">
const accountStore = useAccountStore()
const { aggregatedPortfolioBalances } = useBalance()

defineProps({
  hideBalances: {
    type: Boolean
  }
})
</script>

<template>
  <div
    v-if="accountStore.hasMultipleSubaccounts"
    class="flex space-x-4 items-center mt-4 overflow-x-auto overflow-y-hidden"
  >
    <PartialsAccountSubaccountSelectorItem
      v-for="[subaccountId, balances] in Object.entries(
        aggregatedPortfolioBalances
      ).sort(([subaccountA], [subaccountB]) =>
        subaccountA.localeCompare(subaccountB)
      )"
      v-bind="{
        subaccountId,
        balances,
        hideBalances
      }"
      :key="`subaccount-${subaccountId}`"
    />
  </div>
</template>
