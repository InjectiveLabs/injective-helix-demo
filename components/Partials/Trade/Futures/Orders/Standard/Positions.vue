<script setup lang="ts">
const accountStore = useAccountStore()
const positionStore = usePositionStore()

const filteredPosition = computed(() =>
  positionStore.positions.filter((position) => {
    const isPartOfSubaccount =
      position.subaccountId === accountStore.subaccountId

    return isPartOfSubaccount
  })
)
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioPositionsTableHeader />
    <PartialsPortfolioPositionsTableRow
      v-for="position in filteredPosition"
      :key="`${position.marketId}-${position.subaccountId}`"
      v-bind="{ position }"
    />

    <CommonEmptyList
      v-if="filteredPosition.length === 0"
      :message="'No Open Positions'"
    />
  </div>
</template>
