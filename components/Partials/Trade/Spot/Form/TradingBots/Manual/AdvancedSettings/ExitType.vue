<script setup lang="ts">
import { ExitType } from '@injectivelabs/sdk-ts'
import { MarketKey, SpotGridTradingField, UiSpotMarket } from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { value: exitTypeValue } = useStringField({
  name: SpotGridTradingField.ExitType,
  initialValue: ExitType.Default,
  rule: ''
})

const exitType = computed({
  get: () => exitTypeValue.value === ExitType.Quote,
  set: (isTrue: boolean) => {
    exitTypeValue.value = isTrue ? ExitType.Quote : ExitType.Default
  }
})
</script>

<template>
  <div class="flex items-center text-coolGray-450 font-medium">
    <AppCheckbox v-model="exitType">
      {{
        $t('tradingBots.sellSymbolUponTermination', {
          symbol: market.baseToken.symbol
        })
      }}
    </AppCheckbox>
  </div>
</template>
