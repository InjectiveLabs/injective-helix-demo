<script lang="ts" setup>
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  MarketType,
  UiDerivativeTrade,
  UiSpotTrade
} from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken, UiTrade } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  trade: {
    required: true,
    type: Object as PropType<UiTrade>
  }
})

const isSpot = props.market.type === MarketType.Spot

const price = computed(() =>
  isSpot
    ? new BigNumberInBase(
        new BigNumberInBase((props.trade as UiSpotTrade).price).toWei(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
      )
    : new BigNumberInWei(
        (props.trade as UiDerivativeTrade).executionPrice
      ).toBase(props.market.quoteToken.decimals)
)

const quantity = computed(() =>
  isSpot
    ? new BigNumberInWei((props.trade as UiSpotTrade).quantity).toBase(
        props.market.baseToken.decimals
      )
    : new BigNumberInBase((props.trade as UiDerivativeTrade).executionQuantity)
)

const { valueToFixed: priceToFormat } = useBigNumberFormatter(price, {
  decimalPlaces: props.market.priceDecimals
})

const { valueToFixed: quantityToFormat } = useBigNumberFormatter(quantity, {
  decimalPlaces: props.market.quantityDecimals
})

const time = computed(() =>
  props.trade.executedAt ? format(props.trade.executedAt, 'HH:mm:ss') : ''
)
</script>

<template>
  <li
    v-if="market"
    :data-cy="`trades-table-${
      trade.tradeDirection === TradeDirection.Buy ? 'buy' : 'sell'
    }-row`"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative"
  >
    <span
      class="w-1/3 text-xs px-2 text-right font-mono"
      data-cy="trades-table-price-span"
      :class="{
        'text-green-500': trade.tradeDirection === TradeDirection.Buy,
        'text-red-500': trade.tradeDirection === TradeDirection.Sell
      }"
    >
      {{ priceToFormat }}
    </span>
    <span
      class="w-1/3 text-xs px-2 text-right font-mono"
      data-cy="trades-table-quantity-span"
    >
      {{ quantityToFormat }}
    </span>
    <span
      class="w-1/3 text-xs px-2 text-gray-500 text-right font-mono"
      data-cy="trades-table-time-span"
    >
      {{ time }}
    </span>
  </li>
</template>
