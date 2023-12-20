<script lang="ts" setup>
import { OrderSide } from '@injectivelabs/ts-types'
import { TradeField, UiMarketWithToken } from '@/types'

const setFormValues = useSetFormValues()

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const filterList = [OrderSide.Buy, OrderSide.Sell]

const { value: orderSide } = useStringField({
  name: TradeField.OrderSide,
  initialValue: OrderSide.Buy,
  rule: 'required'
})

function onSelectOrderSide() {
  setFormValues(
    {
      [TradeField.ProportionalPercentage]: 0
    },
    false
  )
}
</script>

<template>
  <div class="rounded flex h-9">
    <AppSelectButton
      v-for="orderSideItem in filterList"
      :key="`trade-form-order-${orderSideItem}`"
      v-model="orderSide"
      class="w-1/2 bg-gray-1000 shadow-sm"
      :value="orderSideItem"
      @update:modelValue="onSelectOrderSide"
    >
      <template #default="{ isActive }">
        <span
          class="uppercase rounded text-xs tracking-wide border px-5 h-9 flex"
          :class="{
            'text-gray-300 border-transparent': !isActive,
            'text-green-500 border-green-500':
              isActive && orderSide === OrderSide.Buy,
            'text-red-500 border-red-500':
              isActive && orderSide === OrderSide.Sell
          }"
        >
          <span v-if="orderSideItem === OrderSide.Buy" class="m-auto">
            {{
              $t('trade.buy_asset', {
                asset: market.baseToken.symbol
              })
            }}
          </span>
          <span v-else class="m-auto">
            {{
              $t('trade.sell_asset', {
                asset: market.baseToken.symbol
              })
            }}
          </span>
        </span>
      </template>
    </AppSelectButton>
  </div>
</template>
