<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { PerpetualMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    order: DerivativeOrderHistory
  }>(),
  {}
)

const {
  type,
  isBuy,
  total,
  price,
  market,
  quantity,
  timestamp,
  isStopLoss,
  orderStatus,
  isTakeProfit,
  triggerPrice,
  isReduceOnly,
  priceDecimals,
  isMarketOrder,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => false)
)
</script>

<template>
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <div
        class="flex-1 flex items-center p-2 font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTimeStamp)"
      >
        {{ timestamp }}
      </div>

      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryMarketTicker)">
          {{ market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          class="font-sans"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderType)"
        >
          {{ type }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2">
        <div>
          <p
            class="font-sans"
            :class="{
              'text-green-500': isBuy,
              'text-red-500': !isBuy
            }"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistorySide)"
          >
            {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
          </p>

          <p v-if="isReduceOnly" class="text-coolGray-400">
            {{ $t('trade.reduce_only') }}
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <span v-if="isMarketOrder" class="font-sans">
          {{ $t('trade.market') }}
        </span>

        <span
          v-else
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryPrice)"
        >
          <AppAmount
            v-bind="{
              amount: price.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
        </span>
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryAmount)"
      >
        <AppAmount
          v-bind="{
            amount: quantity.toFixed(),
            decimalPlaces: quantityDecimals
          }"
        />
      </div>

      <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTotal)">
          <AppAmount
            v-bind="{
              amount: total.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
        </span>

        <span v-if="market" class="text-coolGray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </div>

      <div
        :class="[
          order.isConditional
            ? 'flex-col items-end'
            : 'justify-end items-center'
        ]"
        class="flex-1 flex p-2 justify-end"
      >
        <template v-if="order.isConditional">
          <span class="text-coolGray-500 text-xs font-semibold">
            {{ $t('trade.mark_price') }}
          </span>

          <div>
            <span v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)">
              <span class="text-white text-xs font-semibold">&le;</span>
            </span>
            <span v-else class="text-white text-xs font-semibold">&ge;</span>

            <AppAmount
              v-bind="{
                decimalPlaces: priceDecimals,
                amount: triggerPrice.toFixed()
              }"
            />
          </div>
        </template>

        <template v-else>
          <span>&mdash;</span>
        </template>
      </div>

      <div class="flex-1 flex font-sans items-center p-2">
        <span
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderStatus)"
        >
          {{ orderStatus }}
        </span>
      </div>
    </div>
  </div>
</template>
