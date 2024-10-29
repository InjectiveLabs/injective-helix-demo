<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'
import { SpotMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    order: SpotOrderHistory
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
  orderStatus,
  triggerPrice,
  priceDecimals,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => true)
)

const { valueToFixed: priceToFixed } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToFixed: quantityToFixed } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToFixed: totalToFixed } = useSharedBigNumberFormatter(total, {
  decimalPlaces: priceDecimals.value
})

const { valueToFixed: triggerPriceToFixed } = useSharedBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: priceDecimals.value
  }
)
</script>

<template>
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <div
        class="flex-1 flex items-center p-2 font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTimestamp)"
      >
        {{ timestamp }}
      </div>
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryMarketTicker)">
          {{ market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>

      <div
        class="flex-[0.5] flex items-center p-2 font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryType)"
      >
        {{ type }}
      </div>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
          class="font-sans"
          :data-cy="`${dataCyTag(SpotMarketCyTags.OrderHistorySide)}-${
            order.direction
          }`"
        >
          {{ $t(`trade.${order.direction}`) }}
        </span>
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryPrice)"
      >
        <AppAmount
          v-bind="{
            amount: priceToFixed
          }"
        />
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryAmount)"
      >
        <AppAmount
          v-bind="{
            amount: quantityToFixed
          }"
        />
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTotal)"
      >
        <AppAmount
          v-bind="{
            amount: totalToFixed
          }"
        />
        <span class="text-coolGray-500 ml-1">
          {{ market?.quoteToken.symbol }}
        </span>
      </div>

      <div class="flex-1 flex justify-center items-center p-2">
        <span v-if="triggerPrice.eq(0)"> &mdash; </span>
        <span v-else :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTrigger)">
          <AppAmount
            v-bind="{
              amount: triggerPriceToFixed
            }"
          />
        </span>
      </div>

      <div
        class="flex-1 flex items-center p-2 font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryStatus)"
      >
        {{ orderStatus }}
      </div>
    </div>
  </div>
</template>
