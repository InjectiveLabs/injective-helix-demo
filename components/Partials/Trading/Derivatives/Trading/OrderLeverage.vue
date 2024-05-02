<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedUiDerivativeMarket } from '@shared/types'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  isBuy: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  leverageFieldName: {
    type: String as PropType<TradeField>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const { tradingTypeMarket } = useSpotFormFormatter(formValues)
const { markPrice } = useDerivativeLastPrice(computed(() => props.market))

const maxLeverageAvailable = computed(() => {
  const maxLeverage = new BigNumberInBase(
    new BigNumberInBase(1)
      .dividedBy((props.market as SharedUiDerivativeMarket).initialMarginRatio)
      .dp(0)
  )

  const steps = [1, 2, 3, 5, 10, 20, 50, 100, 150, 200]

  const stepsLessThanMaxLeverage = steps.filter(
    (step) => step <= maxLeverage.toNumber()
  )

  return stepsLessThanMaxLeverage.length > 0
    ? new BigNumberInBase(
        stepsLessThanMaxLeverage[stepsLessThanMaxLeverage.length - 1]
      ).toFixed()
    : new BigNumberInBase(20).toFixed()
})

const maxLeverageAllowed = computed(() => {
  const useExecutionPrice = !tradingTypeMarket.value
  const price = useExecutionPrice
    ? props.executionPrice
    : props.worstPriceWithSlippage

  const priceWithMarginRatio = new BigNumberInBase(markPrice.value).times(
    (props.market as SharedUiDerivativeMarket).initialMarginRatio
  )

  const priceBasedOnOrderSide = props.isBuy
    ? priceWithMarginRatio.minus(markPrice.value).plus(price)
    : priceWithMarginRatio.plus(markPrice.value).minus(price)

  return price.dividedBy(priceBasedOnOrderSide)
})

const {
  value: leverage,
  setValue,
  resetField
} = useStringField({
  name: props.leverageFieldName,
  initialValue: '1',
  rule: 'required',
  dynamicRule: computed(
    () => `maxLeverage:${maxLeverageAllowed.value.toFixed()},${props.isBuy}`
  )
})

function validateLeverage(value: string) {
  nextTick(() => {
    const leverageToBigNumber = new BigNumberInBase(value)

    if (leverageToBigNumber.gte(maxLeverageAvailable.value)) {
      setValue(maxLeverageAvailable.value)
    } else if (leverageToBigNumber.lt(0.1)) {
      resetField()
    }
  })
}

const onValidateLeverage = useDebounceFn((value) => {
  /**
   *Use debounce so we don't potentially reset the field until after they're done typing
   **/
  validateLeverage(value)
}, 500)
</script>

<template>
  <div class="pt-1">
    <div>
      <h3 class="text-xs text-gray-400">
        {{ $t('trade.max_leverage', { max: maxLeverageAvailable }) }}
      </h3>
    </div>

    <div class="range-wrap flex items-center relative select-none gap-2">
      <input
        v-model="leverage"
        min="0.1"
        :max="maxLeverageAvailable.toString()"
        step="0.01"
        class="range"
        type="range"
        @update:modelValue="validateLeverage"
      />
      <div class="relative max-h-6">
        <AppInputNumeric
          v-model="leverage"
          min="0.1"
          step="0.01"
          :max="maxLeverageAvailable.toString()"
          class="leverage-input pr-4 h-1"
          data-cy="trading-page-leverage-input"
          @update:modelValue="onValidateLeverage"
        />
        <span
          class="absolute top-0 right-0 text-xs text-gray-400 mt-1.5 mr-1.5"
        >
          x
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.input-base.leverage-input {
  @apply font-mono ml-2 w-16 py-1 h-auto text-sm text-right rounded-lg appearance-none text-gray-300;
}

/* Chrome, Safari, Edge, Opera */
.leverage-input::-webkit-outer-spin-button,
.leverage-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.leverage-input[type='number'] {
  -moz-appearance: textfield;
}

.range-wrap .range::-moz-range-thumb {
  @apply bg-[#A1A1A3];
}

.range-wrap .range:active::-moz-range-thumb {
  @apply bg-[#A1A1A3];
}

.range-wrap .range::-webkit-slider-thumb {
  @apply bg-[#A1A1A3];
}

.range-wrap .range[disabled]::-webkit-slider-thumb {
  @apply bg-[#A1A1A3];
}

.range-wrap .range:active::-webkit-slider-thumb {
  @apply bg-[#A1A1A3];
}

.range-wrap .range::-ms-thumb {
  @apply bg-[#A1A1A3];
}
</style>
