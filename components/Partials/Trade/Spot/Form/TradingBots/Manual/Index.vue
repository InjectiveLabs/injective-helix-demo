<script setup lang="ts">
import { MarketKey, SpotGridTradingField } from '@/types'
import type { UiSpotMarket, SpotGridTradingForm } from '@/types'

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const formValues = useFormValues<SpotGridTradingForm>()
const { lastTradedPrice } = useSpotLastPrice(spotMarket)

withDefaults(
  defineProps<{
    hasActiveStrategy: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  'view:details': []
}>()

function onViewDetails() {
  emit('view:details')
}

const optimizationValues = computed(() => ({
  market: spotMarket.value,
  currentPrice: lastTradedPrice.value.toNumber(),
  lowerPriceLevel: Number(
    formValues.value[SpotGridTradingField.LowerPrice] || 0
  ),
  upperPriceLevel: Number(
    formValues.value[SpotGridTradingField.UpperPrice] || 0
  ),
  baseQuantity: Number(
    formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
  ),
  quoteQuantity: Number(
    formValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
  )
}))
</script>

<template>
  <div class="pt-4">
    <PartialsTradeSpotFormTradingBotsManualPriceRangeFields
      v-bind="{ isDisabled: hasActiveStrategy }"
    />
    <PartialsTradeSpotFormTradingBotsManualGridsField
      v-bind="{ isDisabled: hasActiveStrategy }"
    />
    <PartialsTradeSpotFormTradingBotsCommonInvestmentFields
      v-bind="{ isDisabled: hasActiveStrategy }"
    />

    <PartialsTradeSpotFormTradingBotsCommonOptimization
      v-bind="optimizationValues"
    />

    <PartialsTradeSpotFormTradingBotsManualAdvancedSettings />

    <div class="py-4">
      <PartialsTradeSpotFormTradingBotsCommonCreateStrategy
        v-if="!hasActiveStrategy"
      />

      <AppButton v-else class="w-full" @click="onViewDetails">
        {{ $t('sgt.viewDetails') }}
      </AppButton>
    </div>
  </div>
</template>
