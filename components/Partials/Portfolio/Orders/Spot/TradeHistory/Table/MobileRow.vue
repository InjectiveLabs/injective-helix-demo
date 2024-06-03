<script setup lang="ts">
import { SharedUiSpotTrade } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  trade: {
    required: true,
    type: Object as PropType<SharedUiSpotTrade>
  }
})

const {
  fee,
  time,
  price,
  total,
  market,
  quantity,
  priceDecimals,
  quantityDecimals,
  tradeExecutionType
} = useTrade(
  computed(() => props.trade),
  computed(() => true)
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: feeToString } = useSharedBigNumberFormatter(fee, {
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ time }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.type') }}</p>
      <span class="font-sans">
        {{ tradeExecutionType }}
      </span>
    </div>

    <div class="flex items-center px-2 py-4 justify-between">
      <p>{{ $t('trade.side') }}</p>
      <span
        class="font-sans"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.tradeDirection}`) }}
      </span>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>
      <p class="font-mono">{{ priceToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p>{{ quantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.fee') }}</p>

      <p>
        <span>
          {{ feeToString }}
        </span>
        <span class="ml-1 text-gray-500">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 pt-4 pb-2">
      <p>{{ $t('trade.total') }}</p>

      <p v-if="market">
        <span>
          {{ totalToString }}
        </span>
        <span class="ml-1 text-gray-500">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>
  </div>
</template>
