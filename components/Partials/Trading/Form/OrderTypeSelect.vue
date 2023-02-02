<script lang="ts" setup>
import { PropType } from 'vue'
import {
  DerivativeOrderSide,
  MarketType,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import {
  TradeField,
  TradeForm,
  TradeFormValue,
  UiMarketWithToken
} from '@/types'

const props = defineProps({
  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const isSpot = props.market.type === MarketType.Spot

const FilterList = isSpot
  ? [SpotOrderSide.Buy, SpotOrderSide.Sell]
  : [DerivativeOrderSide.Buy, DerivativeOrderSide.Sell]

const { value: orderType } = useStringField({
  name: TradeField.OrderType,
  initialValue: isSpot ? SpotOrderSide.Buy : DerivativeOrderSide.Buy,
  rule: 'required'
})

function handleSelectOrderType() {
  emit('update:formValue', {
    field: TradeField.ProportionalPercentage,
    value: 0
  })
}
</script>

<template>
  <div class="rounded flex h-9">
    <AppSelectButton
      v-for="orderSide in FilterList"
      :key="`trade-form-order-${orderSide}`"
      v-model="orderType"
      class="w-1/2 bg-gray-1000 shadow-sm"
      :value="orderSide"
      @update:modelValue="handleSelectOrderType"
    >
      <template #default="{ active }">
        <span
          class="uppercase rounded text-xs tracking-wide border px-5 h-9 flex"
          :class="{
            'text-gray-300 border-transparent': !active,
            'text-green-500 border-green-500':
              active &&
              (orderSide === DerivativeOrderSide.Buy ||
                orderSide === SpotOrderSide.Buy),
            'text-red-500 border-red-500':
              active &&
              (orderSide === DerivativeOrderSide.Sell ||
                orderSide === SpotOrderSide.Sell)
          }"
        >
          <span
            v-if="
              orderSide === DerivativeOrderSide.Buy ||
              orderSide === SpotOrderSide.Buy
            "
            class="m-auto"
            >{{
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
