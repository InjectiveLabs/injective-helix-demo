<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'
import { MarketKey, DerivativesTradeFormField } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const derivativeStore = useDerivativeStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { markPrice } = useDerivativeLastPrice(market)

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

const isTpSlDisabled = computed(() =>
  derivativeStore.subaccountConditionalOrders.some(
    (order) => order.marketId === market.value.marketId
  )
)

watch(
  () => isTpSlDisabled,
  (isDisabled) => {
    if (isDisabled) {
      takeProfitValue.value = ''
      stopLossValue.value = ''
    }
  }
)
</script>

<template>
  <div class="border-t mt-2">
    <div class="py-2">
      <AppCheckbox2 v-model="isTpSlEnabled" class="text-white">
        {{ $t('trade.tpSl') }}
      </AppCheckbox2>
    </div>

    <div v-if="isTpSlEnabled" class="space-y-2 p-1">
      <div class="space-y-2">
        <AppInputField
          v-model="takeProfitValue"
          :disabled="isTpSlDisabled"
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
          :disabled="isTpSlDisabled"
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
