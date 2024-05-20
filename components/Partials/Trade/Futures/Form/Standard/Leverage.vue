<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { FactoryOpts } from 'imask'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  DerivativesTradeForm,
  DerivativesTradeFormField,
  UiDerivativeMarket,
  derivativeMarketKey
} from '@/types'

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const props = defineProps({
  worstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const { markPrice } = useDerivativeLastPrice(market)

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
            min: 0,
            max: 10,
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

const maxLeverageAllowed = computed(() => {
  const priceWithMarginRatio = new BigNumberInBase(markPrice.value).times(
    market.value.initialMarginRatio
  )

  const priceBasedOnOrderSide =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
      ? priceWithMarginRatio.minus(markPrice.value).plus(props.worstPrice)
      : priceWithMarginRatio.plus(markPrice.value).minus(props.worstPrice)

  return props.worstPrice.dividedBy(priceBasedOnOrderSide)
})

const { value: leverage, errorMessage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: '1',
  dynamicRule: computed(() => `maxLeverage:${maxLeverageAvailable.value}`)
})

function onBlur() {
  typed.value = leverage.value || '0'
}

function onEnter(ev: Event) {
  const target = ev.target as HTMLInputElement
  target.blur()
}
</script>

<template>
  <p class="field-label mb-2">{{ $t('trade.leverage') }}</p>

  <Whiteboard>
    {{ { maxLeverageAllowed } }}
  </Whiteboard>

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
      />
    </div>

    <label class="field-style flex px-3 basis-24 min-w-0 h-12">
      <input
        ref="el"
        :value="leverage"
        type="text"
        class="min-w-0 bg-transparent focus:outline-none font-mono text-sm text-right"
        @keydown.enter="onEnter"
        @blur="onBlur"
      />
      <span class="flex items-center pl-2 select-none">&times;</span>
    </label>
  </div>

  <div>
    {{ errorMessage }}
  </div>
</template>
