<script setup lang="ts">
import { StrategyType, ExitType } from '@injectivelabs/sdk-ts'
import { MarketKey, SpotGridTradingField, UiSpotMarket } from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { value: strategyTypeValue } = useStringField({
  name: SpotGridTradingField.ExitType,
  initialValue: ExitType.Default,
  rule: ''
})

const strategyType = computed({
  get: () => strategyTypeValue.value === StrategyType.Geometric,
  set: (isTrue: boolean) => {
    strategyTypeValue.value = isTrue ? ExitType.Quote : ExitType.Default
  }
})
</script>

<template>
  <div class="flex items-center">
    <AppCheckbox2 v-model="strategyType">
      {{
        $t('sgt.sellSymbolUponTermination', { symbol: market.baseToken.symbol })
      }}
    </AppCheckbox2>
  </div>
</template>
