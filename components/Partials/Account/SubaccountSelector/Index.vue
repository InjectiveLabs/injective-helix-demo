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
    class="flex space-x-4 items-center mt-4"
  >
    <PartialsAccountSubaccountSelectorItem
      v-for="([subaccountId, balances], index) in Object.entries(
        aggregatedPortfolioBalances
      )"
      v-bind="{
        subaccountId,
        balances,
        index,
        hideBalances
      }"
      :key="`subaccount-${subaccountId}`"
    />
  </div>
</template>
