<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField,
  PerpetualMarketCyTags
} from '@/types'

useForm<DerivativesTradeForm>()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { value: orderType } = useStringField({
  name: DerivativesTradeFormField.Type,
  initialValue: DerivativeTradeTypes.Limit
})
const { value: orderSide } = useStringField({
  name: DerivativesTradeFormField.Side,
  initialValue: TradeDirection.Long
})

const {
  margin,
  quantity,
  feeAmount,
  worstPrice,
  feePercentage,
  marginWithFee,
  totalNotional,
  minimumAmountInQuote
} = useDerivativeWorstPrice(market)
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
        :data-cy="`${dataCyTag(
          PerpetualMarketCyTags.DerivativeTradeType
        )}-${value}`"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>

    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="side in [TradeDirection.Long, TradeDirection.Short]"
        :key="side"
        v-bind="{ value: side }"
        v-model="orderSide"
        class="flex-1 p-2 border border-transparent rounded-md text-sm"
        :class="
          side === TradeDirection.Long ? 'text-green-500' : 'text-red-500'
        "
        :active-classes="
          side === TradeDirection.Long ? '!border-green-500' : '!border-red-500'
        "
        :data-cy="`${dataCyTag(PerpetualMarketCyTags.TradeDirection)}-${side}`"
      >
        <span v-if="market.slug === '2024election-perp'">
          {{ $t(`trade.${side === TradeDirection.Long ? 'yes' : 'no'}`) }}
          {{ market.baseToken.name }}
        </span>
        <span v-else>
          {{ $t(`trade.${side === TradeDirection.Long ? 'buy' : 'sell'}`) }}
        </span>
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

      <PartialsTradeFuturesFormStandardAmountField
        v-bind="{ marginWithFee, quantity, minimumAmountInQuote }"
      />

      <PartialsTradeFuturesFormStandardLeverage
        v-bind="{
          worstPrice
        }"
      />
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
