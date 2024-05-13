<script lang="ts" setup>
import { SpotOrderHistory, DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { getMarketRoute } from '@/app/utils/market'

const props = defineProps({
  isSpot: Boolean,

  order: {
    required: true,
    type: Object as PropType<SpotOrderHistory | DerivativeOrderHistory>
  }
})

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
  computed(() => props.isSpot)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})
</script>

<template>
  <tr
    v-if="market"
    :data-cy="'order-table-row-' + market.ticker"
    :data-cy-hash="order.orderHash"
  >
    <td class="h-12 text-left pl-3">
      <span class="text-white text-xs">
        {{ timestamp }}
      </span>
    </td>

    <td class="h-12 text-left cursor-pointer">
      <NuxtLink class="flex items-center justify-start" :to="marketRoute">
        <div v-if="market.baseToken">
          <CommonTokenIcon :token="market.baseToken" is-md />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="order-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </NuxtLink>
    </td>

    <td class="h-12 text-left">
      <span class="text-white text-xs">
        {{ type }}
      </span>
    </td>

    <td class="h-12 text-left">
      <span
        data-cy="order-order-side-table-data"
        class="text-xs"
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ isBuy ? $t('trade.buy') : $t('trade.sell') }}
      </span>
      <span
        v-if="isReduceOnly"
        class="ml-1 text-xs text-gray-500"
        data-cy="derivative-order-reduce-only-table-data"
      >
        {{ $t('trade.reduce_only') }}
      </span>
    </td>

    <td class="h-12 font-mono text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <AppNumber
        v-else
        is-xs
        data-cy="order-price-table-data"
        :decimals="priceDecimals"
        :number="price"
      />
    </td>

    <td class="h-12 text-right font-mono">
      <AppNumber
        is-xs
        data-cy="order-quantity-table-data"
        :decimals="quantityDecimals"
        :number="quantity"
      />
    </td>

    <td class="h-12 font-right text-right">
      <AppNumber
        is-xs
        data-cy="order-total-table-data"
        :decimals="market.priceDecimals"
        :number="total"
      >
        <template #addon>
          <span class="text-xs text-gray-500">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppNumber>
    </td>

    <td class="h-12 flex items-center justify-end gap-1">
      <template v-if="(order as DerivativeOrderHistory).isConditional">
        <span class="text-gray-500 text-xs font-semibold">
          {{ $t('trade.mark_price') }}
        </span>

        <span
          v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
          class="text-white text-xs font-semibold"
        >
          &le;
        </span>
        <span v-else class="text-white text-xs font-semibold"> &ge; </span>

        <AppNumber
          is-xs
          data-cy="order-total-table-data"
          :decimals="market.priceDecimals"
          :number="triggerPrice"
        />
      </template>

      <template v-else>
        <span>&mdash;</span>
      </template>
    </td>

    <td class="h-12 relative text-right pr-3">
      <span class="text-white text-xs">
        {{ orderStatus }}
      </span>
    </td>
  </tr>
</template>
