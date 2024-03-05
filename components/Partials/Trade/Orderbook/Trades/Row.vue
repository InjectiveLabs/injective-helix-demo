<script setup lang="ts">
import { UiDerivativeTrade, UiSpotTrade } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UiMarketWithToken, UiTrade } from '@/types'

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  trade: {
    required: true,
    type: Object as PropType<UiTrade>
  }
})

const price = computed(() =>
  props.isSpot
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
  props.isSpot
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
  <div
    class="flex font-mono leading-4 !text-[11px] text-right hover:bg-brand-800 cursor-pointer"
  >
    <div
      class="flex-1 min-w-0 truncate px-1"
      :class="{
        'text-green-500': trade.tradeDirection === TradeDirection.Buy,
        'text-red-500': trade.tradeDirection === TradeDirection.Sell
      }"
    >
      {{ priceToFormat }}
    </div>

    <div class="flex-1 min-w-0 truncate px-1">
      {{ quantityToFormat }}
    </div>

    <div class="flex-1 min-w-0 truncate px-1 text-gray-500">
      {{ time }}
    </div>
  </div>
</template>
