<script setup lang="ts">
import { SpotGridTradingField } from '@/types'

const gridStrategyStore = useGridStrategyStore()

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: 'requiredSgt',
    dynamicRule: computed(() => ``)
  })

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: SpotGridTradingField.UpperPrice,
    rule: 'requiredSgt',
    dynamicRule: computed(() => `minValueSgt:${lowerPriceValue.value}`)
  })
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <AppInputNumeric v-model="lowerPriceValue">
        <template #context>
          <p class="text-xs font-semibold text-gray-200 mb-2">
            {{ $t('sgt.lowerPrice') }}
          </p>
        </template>

        <template #addon>
          <span v-if="gridStrategyStore.spotMarket">
            {{ gridStrategyStore.spotMarket.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold mt-2">
        {{ lowerErrorMessage }}
      </div>
    </div>

    <div>
      <AppInputNumeric v-model="upperPriceValue">
        <template #context>
          <p class="text-xs font-semibold text-gray-200 mb-2">
            {{ $t('sgt.upperPrice') }}
          </p>
        </template>

        <template #addon>
          <span v-if="gridStrategyStore.spotMarket">
            {{ gridStrategyStore.spotMarket.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>

      <div class="text-red-500 text-xs font-semibold mt-2">
        {{ upperErrorMessage }}
      </div>
    </div>
  </div>
</template>
