<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { FactoryOpts } from 'imask'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField,
  PerpetualMarketCyTags
} from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const props = withDefaults(
  defineProps<{
    worstPrice: BigNumberInBase
  }>(),
  {}
)

const { markPrice } = useDerivativeLastPrice(market)

const maxLeverageAvailable = computed(() => {
  const maxLeverage = new BigNumberInBase(
    new BigNumberInBase(1).dividedBy(market.value.initialMarginRatio).dp(0)
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

const { el, typed } = useIMask(
  computed(
    () =>
      ({
        mask: 'num',
        lazy: false,
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ',',
            radix: '.',
            mapToRadix: ['.', ','],
            scale: 2,
            lazy: false,
            min: 0.1,
            max: Number(maxLeverageAvailable.value),
            autofix: true
          }
        }
      }) as FactoryOpts
  )
)

const leverageModel = computed({
  get: () => leverage.value || '0',
  set: (value) => {
    leverage.value = value
    typed.value = value
  }
})

watch(
  () => typed.value,
  (value) => {
    leverage.value = value
  }
)

const maxLeverageAllowed = computed(() => {
  if (
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.Market
  ) {
    const priceWithMarginRatio = new BigNumberInBase(markPrice.value).times(
      market.value.initialMarginRatio
    )

    const priceBasedOnOrderSide =
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
        ? priceWithMarginRatio.minus(markPrice.value).plus(props.worstPrice)
        : priceWithMarginRatio.plus(markPrice.value).minus(props.worstPrice)

    return props.worstPrice.dividedBy(priceBasedOnOrderSide)
  } else {
    return new BigNumberInBase(maxLeverageAvailable.value)
  }
})

const { value: leverage, errorMessage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: '1',
  dynamicRule: computed(() => `maxLeverage:${maxLeverageAllowed.value}`)
})

function onBlur() {
  typed.value = leverage.value || '1'

  onMouseUp()
}

function onEnter(ev: Event) {
  const target = ev.target as HTMLInputElement
  target.blur()
}

function onMouseUp() {
  if (maxLeverageAllowed.value.lt(leverage.value)) {
    leverageModel.value = maxLeverageAllowed.value.toFixed()
  }

  if (Number(leverage.value) < 0) {
    leverageModel.value = '0.01'
  }
}

watch(
  () => derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly],
  () => {
    leverageModel.value = '1'
  }
)
</script>

<template>
  <template v-if="!derivativeFormValues[DerivativesTradeFormField.ReduceOnly]">
    <p class="field-label mb-2">{{ $t('trade.leverage') }}</p>

    <div class="flex items-center">
      <div class="flex-1 pr-4 relative">
        <div
          class="absolute top-2 bottom-3 right-4 inset-x-0 bg-brand-800 rounded-md"
        />

        <input
          v-model="leverageModel"
          min="0.01"
          :max="Number(maxLeverageAvailable)"
          step="0.01"
          type="range"
          class="range w-full"
          @mouseup="onMouseUp"
        />
      </div>

      <label class="field-style flex px-3 basis-24 min-w-0 h-12">
        <input
          ref="el"
          :value="leverage"
          type="text"
          class="min-w-0 bg-transparent focus:outline-none font-mono text-sm text-right"
          :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageInputField)"
          @keydown.enter="onEnter"
          @blur="onBlur"
        />
        <span class="flex items-center pl-2 select-none">&times;</span>
      </label>
    </div>

    <p
      class="error-message"
      :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageError)"
    >
      {{ errorMessage }}
    </p>
  </template>
</template>
