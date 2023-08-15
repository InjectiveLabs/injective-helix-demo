<script setup lang="ts">
import { SpotGridTradingField } from '@/types'

const gridStore = useGridStore()

const { value: lowerPriceValue } = useStringField({
  name: SpotGridTradingField.LowerPrice,
  rule: 'required',
  dynamicRule: computed(() => ``)
})

const { value: upperPriceValue } = useStringField({
  name: SpotGridTradingField.UpperPrice,
  rule: 'required',
  dynamicRule: computed(() => `minValue:${lowerPriceValue.value}`)
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
          <span v-if="gridStore.market">
            {{ gridStore.market.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>
    </div>
    <div>
      <AppInputNumeric v-model="upperPriceValue">
        <template #context>
          <p class="text-xs font-semibold text-gray-200 mb-2">
            {{ $t('sgt.upperPrice') }}
          </p>
        </template>

        <template #addon>
          <span v-if="gridStore.market">
            {{ gridStore.market.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>
    </div>
  </div>
</template>
