<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { SpotGridTradingField } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const gridStrategyStore = useGridStrategyStore()

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(
      () =>
        `requiredSgt|lessThanSgt:${lastTradedPrice.value.minus(
          lastTradedPrice.value.times(0.05)
        )}`
    )
  })

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: SpotGridTradingField.UpperPrice,
    rule: '',
    dynamicRule: computed(
      () =>
        `requiredSgt|greaterThanSgt:${lastTradedPrice.value.plus(
          lastTradedPrice.value.times(0.05)
        )}`
    )
  })
</script>

<template>
  <div>
    <p class="font-bold text-sm tracking-wide py-4">
      {{ $t('sgt.priceRange') }}
    </p>

    <div class="grid grid-cols-1 gap-4 mb-4">
      <div>
        <AppInputNumeric
          v-model="lowerPriceValue"
          placeholder="0.00"
          class="text-right"
        >
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
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
        <AppInputNumeric
          v-model="upperPriceValue"
          placeholder="0.00"
          class="text-right"
        >
          <template #context>
            <p class="text-xs font-light text-gray-200 mb-2">
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
  </div>
</template>
