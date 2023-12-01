<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { getSgtContractAddressFromSlug } from '@/app/utils/helpers'

const props = defineProps({
  isLiquidity: Boolean,

  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const spotStore = useSpotStore()
const gridStrategyStore = useGridStrategyStore()

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(market.value.slug)
    )!
)

const { pnl } = useActiveGridStrategy(market, activeStrategy)
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <PartialsGridStrategySpotCommonDetails v-slot="{ detailsPageChange }">
      <AppButton
        is-lg
        class="w-full shadow-none select-none bg-blue-500 text-blue-900"
        @click="detailsPageChange"
      >
        {{ $t('sgt.viewOrders') }}
      </AppButton>
    </PartialsGridStrategySpotCommonDetails>

    <PartialsGridStrategySpotCommonRemoveStrategy
      v-if="activeStrategy"
      v-bind="{
        createdAt: activeStrategy.createdAt,
        pnl: pnl.toFixed(),
        isLiquidity
      }"
    >
      <template #default="{ removeStrategy, status }">
        <AppButton
          v-bind="{ status }"
          is-lg
          class="w-full shadow-none select-none text-blue-500 border-blue-500"
          @click="removeStrategy"
        >
          {{ $t('sgt.endBot') }}
        </AppButton>
      </template>
    </PartialsGridStrategySpotCommonRemoveStrategy>
  </div>
</template>
