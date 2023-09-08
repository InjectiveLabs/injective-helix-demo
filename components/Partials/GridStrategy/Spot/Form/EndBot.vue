<script setup lang="ts">
import { getSgtContractAddressFromSlug } from 'app/utils/helpers'

const gridStrategyStore = useGridStrategyStore()

const market = computed(() => gridStrategyStore.spotMarket!)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug || '')
    )!
)

const { pnl } = useActiveGridStrategy(market, activeStrategy)
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <PartialsGridStrategySpotCommonDetails v-slot="{ detailsPageChange }">
      <AppButton
        lg
        class="w-full font-sembold shadow-none select-none bg-blue-500 text-white"
        @click="detailsPageChange"
      >
        {{ $t('sgt.viewOrders') }}
      </AppButton>
    </PartialsGridStrategySpotCommonDetails>

    <PartialsGridStrategySpotCommonRemoveStrategy
      v-bind="{ createdAt: activeStrategy.createdAt, pnl: pnl.toString() }"
    >
      <template #default="{ removeStrategy, status }">
        <AppButton
          v-bind="{ status }"
          lg
          class="w-full font-sembold shadow-none select-none text-blue-500 border-blue-500"
          @click="removeStrategy"
        >
          {{ $t('sgt.endBot') }}
        </AppButton>
      </template>
    </PartialsGridStrategySpotCommonRemoveStrategy>
  </div>
</template>
