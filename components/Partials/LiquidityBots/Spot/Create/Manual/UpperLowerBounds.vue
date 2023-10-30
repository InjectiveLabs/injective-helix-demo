<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { SpotGridTradingField } from '@/types'
import { getSgtInvalidRange } from '@/app/utils/helpers'
import {
  GST_DEFAULT_AUTO_GRIDS,
  GST_DEFAULT_PRICE_TICK_SIZE,
  GST_MAXIMUM_GRIDS,
  GST_MINIMUM_GRIDS
} from 'app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues()

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const sgtInvalidRange = computed(() => {
  const levels = new BigNumberInBase(
    formValues.value[SpotGridTradingField.Grids] || GST_DEFAULT_AUTO_GRIDS
  )

  return getSgtInvalidRange({
    midPrice: lastTradedPrice.value.toFixed(),
    levels:
      levels.gt(GST_MAXIMUM_GRIDS) || levels.lt(GST_MINIMUM_GRIDS)
        ? GST_DEFAULT_AUTO_GRIDS
        : levels.toFixed(0),
    minPriceTickSize: gridStrategyStore.spotMarket
      ? new BigNumberInWei(gridStrategyStore.spotMarket.minPriceTickSize)
          .toBase(
            gridStrategyStore.spotMarket.quoteToken.decimals -
              gridStrategyStore.spotMarket.baseToken.decimals
          )
          .toFixed()
      : GST_DEFAULT_PRICE_TICK_SIZE
  })
})

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: SpotGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(() => {
      const { lowerLimit, upperLimit } = sgtInvalidRange.value

      const invalidIfBetweenRule = `invalidIfBetween:${lowerLimit},${upperLimit}`

      const rules = ['requiredSgt', invalidIfBetweenRule]

      return rules.join('|')
    })
  })

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: SpotGridTradingField.UpperPrice,
    rule: '',
    dynamicRule: computed(() => {
      const { lowerLimit, upperLimit } = sgtInvalidRange.value

      const invalidIfBetweenRule = `invalidIfBetween:${lowerLimit},${upperLimit}`

      const greaterThanRule = `greaterThanSgt:${
        formValues.value[SpotGridTradingField.LowerPrice] || 0
      }`

      const rules = ['requiredSgt', invalidIfBetweenRule, greaterThanRule]

      return rules.join('|')
    })
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
