<script setup lang="ts">
import { Position, TradeDirection } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  position: {
    type: Object as PropType<Position>,
    required: true
  }
})

const tokenStore = useTokenStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()

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

const marketCloseStatus = reactive(new Status(StatusType.Idle))
// const limitCloseStatus = reactive(new Status(StatusType.Idle))

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: quantityInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    quantity.value
      .times(markPrice.value)
      .times(tokenStore.tokenUsdPrice(market.value?.quoteToken) || 0)
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: markPriceToString } = useSharedBigNumberFormatter(
  markPrice,
  {
    decimalPlaces: priceDecimals.value
  }
)

const { valueToString: marginToString } = useSharedBigNumberFormatter(margin, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: pnlToString } = useSharedBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: percentagePnlToString } = useSharedBigNumberFormatter(
  percentagePnl,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

function closePosition() {
  marketCloseStatus.setLoading()

  positionStore
    .closePositionAndReduceOnlyOrders({
      position: props.position,
      market: market.value,
      reduceOnlyOrders: []
    })
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}
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

    <div class="flex-[3] flex items-center p-2 overflow-hidden space-x-2">
      <AppButton
        v-bind="{ status: marketCloseStatus }"
        size="sm"
        variant="danger-ghost"
        class="basis-16 shrink-0"
        @click="closePosition"
      >
        Market
      </AppButton>
      <AppButton size="sm" variant="danger-ghost"> Limit </AppButton>

      <AppInputBase class="p-1 rounded min-w-0 border" placeholder="Qty" />
      <AppInputBase class="p-1 rounded min-w-0 border" placeholder="Price" />
    </div>
  </div>
</template>
