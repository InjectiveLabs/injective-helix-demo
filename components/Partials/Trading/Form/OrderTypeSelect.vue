<script lang="ts" setup>
import { PropType } from 'vue'
import {
  DerivativeOrderSide,
  MarketType,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'

const formValues = useFormValues<TradeForm>()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const filterList = isSpot
  ? [SpotOrderSide.Buy, SpotOrderSide.Sell]
  : [DerivativeOrderSide.Buy, DerivativeOrderSide.Sell]

const { value: orderType } = useStringField({
  name: TradeField.OrderType,
  initialValue: isSpot ? SpotOrderSide.Buy : DerivativeOrderSide.Buy,
  rule: 'required'
})

function handleSelectOrderType() {
  formValues.value[TradeField.ProportionalPercentage] = 0
}
</script>

<template>
  <div class="rounded flex h-9">
    <AppSelectButton
      v-for="orderSide in filterList"
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
