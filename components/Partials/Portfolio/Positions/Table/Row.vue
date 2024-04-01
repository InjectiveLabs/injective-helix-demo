<script setup lang="ts">
import { PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  position: {
    type: Object as PropType<PositionV2>,
    required: true
  }
})

const tokenStore = useTokenStore()

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  markPrice,
  priceDecimals,
  percentagePnl,
  // notionalValue,
  // isBinaryOptions,
  // liquidationPrice,
  quantityDecimals,
  effectiveLeverage
} = useDerivativePosition(computed(() => props.position))

const { valueToString: quantityToString } = useBigNumberFormatter(quantity, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: quantityInUsdToString } = useBigNumberFormatter(
  computed(() =>
    quantity.value
      .times(markPrice.value)
      .times(tokenStore.tokenUsdPrice(market.value?.quoteToken) || 0)
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: priceToString } = useBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: markPriceToString } = useBigNumberFormatter(markPrice, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: marginToString } = useBigNumberFormatter(margin, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: pnlToString } = useBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: percentagePnlToString } = useBigNumberFormatter(
  percentagePnl,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div class="flex p-2 font-mono text-xs">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="flex-1 flex items-center p-2">
      <span
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ $t(`trade.${position.direction}`) }}
      </span>
    </div>

    <div class="flex-1 flex items-center p-2">
      <div v-if="market" class="space-y-1">
        <p>{{ quantityToString }} {{ market.baseToken.symbol }}</p>
      </div>
    </div>

    <div class="flex-1 space-y-1 p-2">
      <p>{{ priceToString }}</p>
      <p class="text-gray-500">{{ markPriceToString }}</p>
    </div>

    <div class="flex-1 flex items-center p-2">
      <div
        class="space-y-1"
        :class="{
          'text-green-500': pnl.gte(0),
          'text-red-500': pnl.lt(0)
        }"
      >
        <p>{{ pnlToString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ percentagePnlToString }}%</p>
      </div>
    </div>

    <div class="flex-1 flex items-center p-2">
      <div v-if="market" class="space-y-1">
        <p>$ {{ quantityInUsdToString }}</p>
      </div>
    </div>

    <div class="flex-1 flex items-center p-2">{{ marginToString }}</div>
    <div class="flex-1 flex items-center p-2">
      {{ effectiveLeverage.toFormat(2) }}x
    </div>
    <div class="flex-1 flex items-center p-2">
      <AppButton size="sm" variant="danger-ghost"> Close </AppButton>
    </div>
  </div>
</template>
