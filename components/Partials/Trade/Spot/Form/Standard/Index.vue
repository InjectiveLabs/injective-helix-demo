<script setup lang="ts">
import { OrderSide } from '@injectivelabs/ts-types'
import { TradeTypes } from '@/types'

const orderType = ref(TradeTypes.Limit)
const orderSide = ref(OrderSide.Buy)
</script>

<template>
  <div class="p-4">
    <div class="border-b">
      <AppButtonSelect
        v-for="value in Object.values(TradeTypes)"
        :key="value"
        v-bind="{ value }"
        v-model="orderType"
        class="text-sm font-semibold text-gray-600 px-4 py-2"
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

    <div class="py-4 space-y-4">
      <PartialsTradeSpotFormStandardLimitPriceField
        v-if="orderType === TradeTypes.Limit"
      />
      <PartialsTradeSpotFormStandardAmountField />
      <PartialsTradeSpotFormStandardTotalField />
    </div>

    <PartialsTradeSpotFormStandardAdvancedSettings class="my-4" />

    <div>
      <PartialsTradeSpotFormStandardCreateOrder />
    </div>
  </div>
</template>
