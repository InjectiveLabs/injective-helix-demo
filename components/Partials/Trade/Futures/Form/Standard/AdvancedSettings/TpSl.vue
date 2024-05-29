<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import {
  DerivativesTradeForm,
  DerivativesTradeFormField,
  UiDerivativeMarket,
  derivativeMarketKey
} from '@/types'

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const derivativeStore = useDerivativeStore()
const { markPrice } = useDerivativeLastPrice(market)
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const { value: isTpSlEnabled } = useBooleanField({
  name: DerivativesTradeFormField.isTpSlEnabled,
  initialValue: false,
  rule: ''
})

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const minMaxRule = isBuy.value ? 'minValue' : 'maxValue'

      const minMaxValueRule = `${minMaxRule}:${new BigNumberInBase(
        markPrice.value
      ).toFixed(market.value.priceDecimals)}`

      return minMaxValueRule
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.StopLoss,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const minMaxRule = !isBuy.value ? 'minValue' : 'maxValue'

      const minMaxValueRule = `${minMaxRule}:${new BigNumberInBase(
        markPrice.value
      ).toFixed(market.value.priceDecimals)}`

      return minMaxValueRule
    })
  })

const isTpDisabled = computed(() => {
  const orderType = isBuy.value ? OrderSide.TakeSell : OrderSide.TakeBuy

  return derivativeStore.subaccountConditionalOrders.some(
    (order) => order.orderType === orderType
  )
})

const isSlDisabled = computed(() => {
  const orderType = isBuy.value ? OrderSide.StopSell : OrderSide.StopBuy

  return derivativeStore.subaccountConditionalOrders.some(
    (order) => order.orderType === orderType
  )
})

watch(
  () => isTpDisabled,
  (isDisabled) => {
    if (isDisabled) {
      takeProfitValue.value = ''
    }
  }
)

watch(
  () => isSlDisabled,
  (isDisabled) => {
    if (isDisabled) {
      stopLossValue.value = ''
    }
  }
)
</script>

<template>
  <div class="border-t mt-2">
    <div class="py-2">
      <AppCheckbox2 v-model="isTpSlEnabled">
        {{ $t('trade.tpSl') }}
      </AppCheckbox2>
    </div>

    <div v-if="isTpSlEnabled" class="space-y-2 p-1">
      <div class="space-y-2">
        <AppInputField
          v-model="takeProfitValue"
          :disabled="isTpDisabled"
          :placeholder="$t('trade.take_Profit')"
          class="placeholder:font-sans"
        />

        <p v-if="takeProfitErrorMessage" class="error-message">
          {{ takeProfitErrorMessage }}
        </p>
      </div>

      <div class="space-y-2">
        <AppInputField
          v-model="stopLossValue"
          :disabled="isSlDisabled"
          :placeholder="$t('trade.stop_Loss')"
          class="placeholder:font-sans"
        />

        <p v-if="stopLossErrorMessage" class="error-message">
          {{ stopLossErrorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
