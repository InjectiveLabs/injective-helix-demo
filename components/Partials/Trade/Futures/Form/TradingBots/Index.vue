<script setup lang="ts">
import { MarketKey } from '@/types'
import type { UiDerivativeMarket, DerivativeGridTradingForm } from '@/types'

const futuresMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const gridStrategyStore = useGridStrategyStore()

useForm<DerivativeGridTradingForm>({
  keepValuesOnUnmount: true
})

const activeStrategy = computed(() =>
  gridStrategyStore.activeDerivativeStrategies.find(
    (strategy) => strategy.marketId === futuresMarket.value?.marketId
  )
)
</script>

<template>
  <div class="p-4">
    <PartialsTradingBotsDerivativeStrategyDetails
      v-if="activeStrategy"
      :active-strategy="activeStrategy"
    />

    <div v-else>
      <div>
        <PartialsTradeFuturesFormTradingBotsManual />
      </div>
    </div>
  </div>
</template>
