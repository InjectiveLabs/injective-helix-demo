<script setup lang="ts">
import { OrderSide } from '@injectivelabs/ts-types'
import {
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'

useForm<DerivativesTradeForm>()

const { value: orderType } = useStringField({
  name: DerivativesTradeFormField.Type,
  initialValue: DerivativeTradeTypes.Limit
})
const { value: orderSide } = useStringField({
  name: DerivativesTradeFormField.Side,
  initialValue: OrderSide.Buy
})

const {
  margin,
  quantity,
  feeAmount,
  worstPrice,
  feePercentage,
  marginWithFee,
  totalNotional
} = useDerivativeWorstPrice()
</script>

<template>
  <div class="p-4">
    <div class="border-b">
      <AppButtonSelect
        v-for="value in Object.values(DerivativeTradeTypes)"
        :key="value"
        v-bind="{ value }"
        v-model="orderType"
        class="text-sm font-semibold text-gray-600 px-3 py-2"
        active-classes="border-b border-blue-500 text-white"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>

    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="side in [OrderSide.Buy, OrderSide.Sell]"
        :key="side"
        v-bind="{ value: side }"
        v-model="orderSide"
        class="flex-1 p-2 border border-transparent rounded-md text-sm"
        :class="side === OrderSide.Buy ? 'text-green-500' : 'text-red-500'"
        :active-classes="
          side === OrderSide.Buy ? '!border-green-500' : '!border-red-500'
        "
      >
        {{ $t(`trade.${side}`) }}
      </AppButtonSelect>
    </div>

    <div class="space-y-4 py-4">
      <PartialsTradeFuturesFormStandardTriggerField
        v-if="
          [
            DerivativeTradeTypes.StopLimit,
            DerivativeTradeTypes.StopMarket
          ].includes(orderType as DerivativeTradeTypes)
        "
      />

      <PartialsTradeFuturesFormStandardLimitPriceField
        v-if="
          [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.Limit].includes(
            orderType as DerivativeTradeTypes
          )
        "
      />

      <PartialsTradeFuturesFormStandardAmountField />
      <PartialsTradeFuturesFormStandardLeverage />
    </div>

    <PartialsTradeFuturesFormStandardAdvancedSettings />

    <PartialsTradeFuturesFormStandardDetails
      v-bind="{
        margin,
        quantity,
        feeAmount,
        worstPrice,
        marginWithFee,
        totalNotional
      }"
    />

    <div>
      <PartialsTradeFuturesFormStandardCreateOrder
        v-bind="{
          margin,
          quantity,
          feeAmount,
          worstPrice,
          feePercentage,
          marginWithFee,
          totalNotional
        }"
      />
    </div>
  </div>
</template>
