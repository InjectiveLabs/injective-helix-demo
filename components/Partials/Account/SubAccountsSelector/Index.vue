<script setup lang="ts">
const accountStore = useAccountStore()
const { aggregatedPortfolioBalances } = useBalance()

defineProps({
  hideBalances: {
    type: Boolean
  }
})

const subaccountIds = computed(() =>
  Object.keys(aggregatedPortfolioBalances.value)
)
</script>

<template>
  <div
    v-if="accountStore.hasMultipleSubaccounts"
    class="flex space-x-4 items-center mt-4"
  >
    <PartialsAccountSubAccountsSelectorItem
      v-for="(subaccountId, index) in subaccountIds"
      v-bind="{
        subaccountId,
        balances: aggregatedPortfolioBalances[subaccountId],
        index,
        hideBalances
      }"
      :key="`subaccount-${subaccountId}`"
    />
  </div>
</template>
