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
  <div class="p-4 lg:pb-8">
    <div class="border-b">
      <AppButtonSelect
        v-for="value in Object.values(DerivativeTradeTypes)"
        :key="value"
        v-bind="{ value }"
        v-model="orderType"
        class="text-xs font-medium capitalize px-3 py-2 text-coolGray-400"
        active-classes="border-b border-blue-550 text-white"
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
        class="flex-1"
        :data-cy="`${dataCyTag(PerpetualMarketCyTags.TradeDirection)}-${side}`"
      >
        <AppButton
          :variant="
            orderSide === side
              ? side === TradeDirection.Long
                ? 'success'
                : 'danger'
              : side === TradeDirection.Long
              ? 'success-cta'
              : 'danger-cta'
          "
          :class="[
            'w-full py-1.5 leading-relaxed focus-within:ring-0',
            side === TradeDirection.Long ? 'hover:bg-green-500' : ''
          ]"
        >
          <span>
            {{ $t(`trade.${side === TradeDirection.Long ? 'buy' : 'sell'}`) }}
          </span>
        </AppButton>
      </AppButtonSelect>
    </div>

    <div class="space-y-4 pt-4">
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
        v-bind="{ marginWithFee, quantity, minimumAmountInQuote, worstPrice }"
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

    <PartialsTradeCommonFormAccountEquity />
  </div>
</template>
