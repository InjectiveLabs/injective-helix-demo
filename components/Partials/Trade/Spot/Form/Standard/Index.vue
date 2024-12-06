<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  MainPage,
  MarketKey,
  TradeTypes,
  UiSpotMarket,
  SpotTradeForm,
  SpotTradeFormField,
  SpotMarketCyTags
} from '@/types'

useForm<SpotTradeForm>()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { value: orderTypeValue } = useStringField({
  name: SpotTradeFormField.Type,
  initialValue: TradeTypes.Limit
})

const { value: orderSideValue } = useStringField({
  name: SpotTradeFormField.Side,
  initialValue: OrderSide.Buy
})

const {
  total,
  quantity,
  feeAmount,
  worstPrice,
  totalWithFee,
  feePercentage,
  slippagePercentage,
  minimumAmountInQuote
} = useSpotWorstPrice(market)
</script>

<template>
  <div class="p-4">
    <div
      class="border-b"
      :data-cy="dataCyTag(SpotMarketCyTags.SpotTradingType)"
    >
      <div class="flex items-center">
        <AppButtonSelect
          v-for="value in Object.values(TradeTypes)"
          :key="value"
          v-bind="{ value }"
          v-model="orderTypeValue"
          class="text-xs font-medium text-coolGray-450 px-4 py-2 hover:text-white"
          active-classes="border-b border-blue-550 text-white"
        >
          {{ $t(`trade.${value}`) }}
        </AppButtonSelect>

        <NuxtLink
          class="text-xs font-medium text-coolGray-450 px-4 py-2 hover:text-white"
          :to="{
            name: MainPage.Swap
          }"
        >
          {{ $t(`navigation.swap`) }}
        </NuxtLink>
      </div>
    </div>

    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="side in [OrderSide.Buy, OrderSide.Sell]"
        :key="side"
        v-bind="{ value: side }"
        v-model="orderSideValue"
        class="flex-1 px-2 py-2.5 border border-transparent rounded-md text-sm font-medium"
        :class="side === OrderSide.Buy ? 'text-green-500' : 'text-red-500'"
        :active-classes="
          side === OrderSide.Buy
            ? 'bg-green-500 text-brand-875'
            : 'bg-red-500 text-brand-875'
        "
        :data-cy="`${dataCyTag(SpotMarketCyTags.SpotTradingSide)}-${side}`"
      >
        {{ $t(`trade.${side}`) }}
      </AppButtonSelect>
    </div>

    <div class="pt-4 space-y-4">
      <PartialsTradeSpotFormStandardLimitPriceField
        v-if="orderTypeValue === TradeTypes.Limit"
      />

      <PartialsTradeSpotFormStandardAmountField
        v-bind="{
          quantity,
          totalWithFee,
          minimumAmountInQuote
        }"
      />
    </div>

    <PartialsTradeSpotFormStandardAdvancedSettings class="my-4" />

    <PartialsTradeSpotFormStandardDetails
      v-bind="{
        total,
        totalWithFee,
        quantity,
        feeAmount,
        worstPrice,
        feePercentage,
        slippagePercentage
      }"
    />

    <div>
      <PartialsTradeSpotFormStandardCreateOrder
        v-bind="{
          quantity,
          worstPrice
        }"
      />
    </div>
  </div>
</template>
