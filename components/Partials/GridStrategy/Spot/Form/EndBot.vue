<script setup lang="ts">
import { getSgtContractAddressFromSlug } from '@/app/utils/helpers'

const gridStrategyStore = useGridStrategyStore()

const { removeStrategy, status, detailsPageChange } = useActiveGridStrategy(
  () => gridStrategyStore.spotMarket!,
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug || '')
    )!
)
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <AppButton
      lg
      class="w-full font-sembold shadow-none select-none bg-blue-500 text-black"
      @click="detailsPageChange"
    >
      {{ $t('sgt.viewOrders') }}
    </AppButton>

    <AppButton
      v-bind="{ status }"
      lg
      class="w-full font-sembold shadow-none select-none text-blue-500 border-blue-500"
      @click="removeStrategy"
    >
      {{ $t('sgt.endBot') }}
    </AppButton>
  </div>
</template>
