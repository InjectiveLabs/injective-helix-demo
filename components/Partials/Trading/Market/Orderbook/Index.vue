<script lang="ts" setup>
import { PropType } from 'vue'
import type { UseScrollReturn } from '@vueuse/core'
import { createPopperLite } from '@popperjs/core'
import { Instance, OptionsGeneric } from '@popperjs/core/lib/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  Change,
  MarketType,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSpotLimitOrder,
  UiOrderbookSummary,
  UiOrderbookPriceLevel,
  UiDerivativeLimitOrder
} from '@injectivelabs/sdk-ui-ts'
import { vScroll } from '@vueuse/components'
import { OrderSide } from '@injectivelabs/ts-types'
import { getAggregationPrice } from '@/app/client/utils/orderbook'
import { computeOrderbookSummary as computeOrderbookSummarySpot } from '@/app/client/utils/spot'
import { computeOrderbookSummary as computeOrderbookSummaryDerivative } from '@/app/client/utils/derivatives'
import { OrderbookLayout, TradingLayout, UiMarketWithToken } from '@/types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  aggregation: {
    type: Number,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const subaccountOrders = computed<
  Array<UiSpotLimitOrder | UiDerivativeLimitOrder>
>(() =>
  isSpot ? spotStore.subaccountOrders : derivativeStore.subaccountOrders
)

const buys = computed(() => {
  return isSpot ? spotStore.buys : derivativeStore.buys
})

const sells = computed(() => {
  return isSpot ? spotStore.sells : derivativeStore.sells
})

const autoScrollSellsLocked = ref(false)
const autoScrollBuysLocked = ref(false)
const buyHoverPosition = ref<number | null>(null)
const sellHoverPosition = ref<number | null>(null)

const popper = ref<Instance | undefined>(undefined)
const orderbookSummaryRef = ref<HTMLElement | undefined>(undefined)
const buyOrdersContainerRef = ref<HTMLElement | undefined>(undefined)
const sellOrdersContainerRef = ref<HTMLElement | undefined>(undefined)
const sellRecordListRef = ref<{ element: HTMLElement }[]>([])
const buyRecordListRef = ref<{ element: HTMLElement }[]>([])

const {
  lastTradedPrice: spotLastTradedPrice,
  lastTradedPriceChange: spotLastTradedPriceChange
} = useSpotLastPrice(computed(() => props.market))

const {
  markPrice,
  lastTradedPrice: derivativeLastTradedPrice,
  lastTradedPriceChange: derivativeLastTradedPriceChange
} = useDerivativeLastPrice(computed(() => props.market))

const lastTradedPrice = computed(() =>
  isSpot ? spotLastTradedPrice.value : derivativeLastTradedPrice.value
)

const lastTradedPriceChange = computed(() =>
  isSpot
    ? spotLastTradedPriceChange.value
    : derivativeLastTradedPriceChange.value
)

const { valueToString: lastTradedPriceToFormat } = useBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces: props.market.priceDecimals
  }
)
const { valueToString: markPriceToFormat } = useBigNumberFormatter(
  computed(() => markPrice.value),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const buyUserOrderPrices = computed(() =>
  subaccountOrders.value.reduce((records, { orderSide, price }) => {
    return orderSide === OrderSide.Buy ? [...records, price] : records
  }, [] as string[])
)

const sellUserOrderPrices = computed(() =>
  subaccountOrders.value.reduce((records, { orderSide, price }) => {
    return orderSide === OrderSide.Sell ? [...records, price] : records
  }, [] as string[])
)

const midOrderbookPrice = computed(() => {
  const [sell] = sells.value
  const [buy] = buys.value
  const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
  const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
  const sum = highestBuy.plus(lowestSell)

  if (sum.lte(0)) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(sum.div(2)).toBase(props.market.quoteToken.decimals)
})

const aggregatedBuyOrders = computed(() => {
  const orders = {} as Record<string, any>

  buys.value.forEach((record: UiPriceLevel) => {
    const price = new BigNumberInBase(
      isSpot
        ? new BigNumberInBase(record.price).toWei(
            props.market.baseToken.decimals - props.market.quoteToken.decimals
          )
        : new BigNumberInWei(record.price).toBase(
            props.market.quoteToken.decimals
          )
    )

    const aggregatedPrice = getAggregationPrice({
      price,
      aggregation: props.aggregation,
      isBuy: true
    })
    const aggregatedPriceKey = aggregatedPrice.toFormat()

    orders[aggregatedPriceKey] = [
      ...(orders[aggregatedPriceKey] || []),
      {
        ...record,
        aggregatedPrice: aggregatedPrice.toFixed()
      }
    ]
  })

  return Object.entries(orders).map(([, orderGroup]) => {
    const [firstOrder] = orderGroup

    const quantity = orderGroup.reduce(
      (sum: BigNumberInWei, order: UiPriceLevel) => {
        return sum.plus(new BigNumberInWei(order.quantity))
      },
      new BigNumberInWei(0)
    )

    const notional = orderGroup.reduce(
      (sum: BigNumberInWei, order: UiPriceLevel) => {
        const notional = new BigNumberInWei(order.quantity)
          .times(order.price)
          .toBase(props.market.quoteToken.decimals)

        return sum.plus(notional)
      },
      new BigNumberInBase(0)
    )

    const aggregatePrices = orderGroup.map(({ price }: UiPriceLevel) => price)

    if (isSpot) {
      return {
        ...firstOrder,
        aggregatePrices,
        quantity
      }
    }

    return {
      ...firstOrder,
      aggregatePrices,
      notional,
      quantity
    }
  })
})

const aggregatedSellOrders = computed(() => {
  const orders = {} as Record<string, any>

  sells.value.forEach((record: UiPriceLevel) => {
    const price = new BigNumberInBase(
      isSpot
        ? new BigNumberInBase(record.price).toWei(
            props.market.baseToken.decimals - props.market.quoteToken.decimals
          )
        : new BigNumberInWei(record.price).toBase(
            props.market.quoteToken.decimals
          )
    )

    const aggregatedPrice = getAggregationPrice({
      price,
      aggregation: props.aggregation,
      isBuy: false
    })
    const aggregatedPriceKey = aggregatedPrice.toFormat()

    orders[aggregatedPriceKey] = [
      ...(orders[aggregatedPriceKey] || []),
      {
        ...record,
        aggregatedPrice: aggregatedPrice.toFixed()
      }
    ]
  })

  return Object.entries(orders)
    .reverse()
    .map(([, orderGroup]) => {
      const [firstOrder] = orderGroup

      const quantity = orderGroup.reduce(
        (sum: BigNumberInWei, order: UiPriceLevel) => {
          return sum.plus(new BigNumberInWei(order.quantity))
        },
        new BigNumberInWei(0)
      )

      const aggregatePrices = orderGroup.map(({ price }: UiPriceLevel) => price)

      return {
        ...firstOrder,
        aggregatePrices,
        quantity
      }
    })
})

const buysTotalNotional = computed(() => {
  const threshold = new BigNumberInBase(1).minus(
    new BigNumberInBase(20).div(100)
  )

  const filteredBuys = aggregatedBuyOrders.value
    .filter((buy) => {
      return new BigNumberInWei(buy.price)
        .toBase(props.market.quoteToken.decimals)
        .div(midOrderbookPrice.value)
        .gte(threshold)
    })
    .sort((a, b) => {
      const aNotional = new BigNumberInWei(a.quantity).times(a.price)
      const bNotional = new BigNumberInWei(b.quantity).times(b.price)

      return new BigNumberInBase(bNotional).minus(aNotional).toNumber()
    })

  if (filteredBuys.length === 0) {
    return ZERO_IN_BASE
  }

  const [highestNotionalBuy] = filteredBuys

  return new BigNumberInWei(highestNotionalBuy.quantity)
    .times(highestNotionalBuy.price)
    .toBase(props.market.quoteToken.decimals)
})

const sellsHighestBaseQuantity = computed(() => {
  const threshold = new BigNumberInBase(1).minus(
    new BigNumberInBase(20).div(100)
  )

  const filteredSells = aggregatedSellOrders.value
    .filter((sell) => {
      return midOrderbookPrice.value
        .div(
          new BigNumberInWei(sell.price).toBase(
            props.market.quoteToken.decimals
          )
        )
        .gte(threshold)
    })
    .sort((a, b) => {
      return new BigNumberInBase(b.quantity).minus(a.quantity).toNumber()
    })

  if (filteredSells.length === 0) {
    return ZERO_IN_BASE
  }

  const [highestSell] = filteredSells

  const highestSellQuantity = isSpot
    ? new BigNumberInWei(highestSell.quantity).toBase(
        props.market.baseToken.decimals
      )
    : new BigNumberInBase(highestSell.quantity)

  return highestSellQuantity
})

const buysWithDepth = computed(() => {
  const sortedAggregatedBuyOrders = [...aggregatedBuyOrders.value].sort(
    (v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
      const v1Price = new BigNumberInWei(v1.price)
      const v2Price = new BigNumberInWei(v2.price)

      return v2Price.minus(v1Price).toNumber()
    }
  )

  return sortedAggregatedBuyOrders.map((record: UiPriceLevel) => {
    const total = new BigNumberInWei(record.quantity)
      .times(record.price)
      .toBase(props.market.quoteToken.decimals)

    return {
      ...record,
      total,
      depth: total.dividedBy(buysTotalNotional.value).times(100).toNumber()
    } as UiOrderbookPriceLevel
  })
})

const buyOrdersSummary = computed<UiOrderbookSummary | undefined>(() => {
  if (buysWithDepth.value.length === 0 || buyHoverPosition.value === null) {
    return
  }

  if (isSpot) {
    const buyOrdersSummary = buysWithDepth.value
      .slice(0, Number(buyHoverPosition.value) + 1)
      .reduce(computeOrderbookSummarySpot, {
        quantity: new BigNumberInWei(0),
        total: new BigNumberInBase(0)
      })

    return {
      ...buyOrdersSummary,
      quantity: buyOrdersSummary.quantity.toBase(
        props.market.baseToken.decimals
      )
    }
  }

  return buysWithDepth.value
    .slice(0, Number(buyHoverPosition.value) + 1)
    .reduce(computeOrderbookSummaryDerivative, {
      quantity: new BigNumberInBase(0),
      total: new BigNumberInBase(0)
    })
})

const sellsWithDepth = computed(() => {
  const sortedAggregatedSellOrders = [...aggregatedSellOrders.value].sort(
    (v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
      const v1Price = new BigNumberInWei(v1.price)
      const v2Price = new BigNumberInWei(v2.price)

      return v1Price.minus(v2Price).toNumber()
    }
  )

  return sortedAggregatedSellOrders
    .map((record: UiPriceLevel) => {
      const baseQuantity = isSpot
        ? new BigNumberInWei(record.quantity).toBase(
            props.market.baseToken.decimals
          )
        : new BigNumberInWei(record.quantity)

      const total = new BigNumberInWei(record.quantity)
        .times(record.price)
        .toBase(props.market.quoteToken.decimals)

      return {
        ...record,
        total,
        depth: baseQuantity
          .dividedBy(sellsHighestBaseQuantity.value)
          .times(100)
          .toNumber()
      } as UiOrderbookPriceLevel
    })
    .reverse()
})

const sellOrdersSummary = computed(() => {
  if (sellsWithDepth.value.length === 0 || sellHoverPosition.value === null) {
    return
  }

  if (isSpot) {
    const sellOrdersSummary = sellsWithDepth.value
      .slice(Number(sellHoverPosition.value))
      .reduce(computeOrderbookSummarySpot, {
        quantity: new BigNumberInWei(0),
        total: new BigNumberInBase(0)
      })

    const quantity = sellOrdersSummary.quantity.toBase(
      props.market.baseToken.decimals
    )

    return {
      ...sellOrdersSummary,
      quantity
    }
  }

  return sellsWithDepth.value
    .slice(Number(sellHoverPosition.value))
    .reduce(computeOrderbookSummaryDerivative, {
      quantity: new BigNumberInBase(0),
      total: new BigNumberInBase(0)
    })
})

const orderBookSummary = computed(() => {
  if (buyHoverPosition.value !== null) {
    return buyOrdersSummary.value
  }

  if (sellHoverPosition.value !== null) {
    return sellOrdersSummary.value
  }

  return undefined
})

const popperOptions = computed<Partial<OptionsGeneric<any>>>(() => ({
  placement:
    appStore.userState.tradingLayout === TradingLayout.Right ? 'left' : 'right'
}))

watch(
  () => props.aggregation,
  () =>
    nextTick(() => {
      onScrollSells()
      onScrollBuys()
    })
)

watch(sells, () => nextTick(onScrollSells))
watch(buys, () => nextTick(onScrollBuys))

onMounted(() => {
  nextTick(() => {
    onScrollSells()
    onScrollBuys()
  })
})

// Make sure to reset the refs before each update.
onBeforeUpdate(() => {
  buyRecordListRef.value = []
  sellRecordListRef.value = []
})

function onScrollSells() {
  const el = sellOrdersContainerRef.value

  if (el && !autoScrollSellsLocked.value) {
    el.scrollTop = el.scrollHeight
  }
}

function onScrollBuys() {
  const el = buyOrdersContainerRef.value

  if (el && !autoScrollBuysLocked.value) {
    el.scrollTop = 0
  }
}

function handleSellOrderHover(position: number | null) {
  sellHoverPosition.value = position

  if (position !== null) {
    /* TODO: see if this works for finding dynamically assigned refs */
    if (sellRecordListRef.value && sellRecordListRef.value[position]) {
      const hoverElement = sellRecordListRef.value[position].element

      popper.value = createPopperLite(
        hoverElement as unknown as Element,
        orderbookSummaryRef.value as HTMLElement,
        popperOptions.value
      )
    }

    nextTick(() => {
      if (orderbookSummaryRef.value) {
        orderbookSummaryRef.value.setAttribute('data-show', '')
      }
    })
  } else {
    if (popper.value) {
      popper.value.destroy()
    }

    if (orderbookSummaryRef.value) {
      orderbookSummaryRef.value.removeAttribute('data-show')
    }
  }
}

function handleBuyOrderHover(position: number | null) {
  buyHoverPosition.value = position

  if (position !== null) {
    if (buyRecordListRef.value && buyRecordListRef.value[position]) {
      const hoverElement = buyRecordListRef.value[position].element

      popper.value = createPopperLite(
        hoverElement as unknown as Element,
        orderbookSummaryRef.value as HTMLElement,
        popperOptions.value
      )
    }

    nextTick(() => {
      if (orderbookSummaryRef.value) {
        orderbookSummaryRef.value.setAttribute('data-show', '')
      }
    })
  } else {
    if (popper.value) {
      popper.value.destroy()
    }

    if (orderbookSummaryRef.value) {
      orderbookSummaryRef.value.removeAttribute('data-show')
    }
  }
}

function hidePopperOnScroll(state: UseScrollReturn) {
  if (orderbookSummaryRef.value) {
    if (state.isScrolling.value) {
      orderbookSummaryRef.value.removeAttribute('data-show')
    } else {
      orderbookSummaryRef.value.setAttribute('data-show', '')
    }
  }
}
</script>

<template>
  <div class="flex flex-col flex-wrap overflow-y-hidden w-full px-2">
    <div
      v-if="appStore.userState.orderbookLayout !== OrderbookLayout.Buys"
      ref="sellOrdersContainerRef"
      v-scroll="hidePopperOnScroll"
      class="overflow-y-scroll overflow-x-hidden w-full"
      :class="{
        'orderbook-half-h':
          appStore.userState.orderbookLayout !== OrderbookLayout.Sells,
        'orderbook-full-h':
          appStore.userState.orderbookLayout === OrderbookLayout.Sells
      }"
    >
      <div class="flex h-full w-full">
        <ul
          class="list-order-book w-full mt-auto"
          @mouseenter="autoScrollSellsLocked = true"
          @mouseleave="autoScrollSellsLocked = false"
        >
          <PartialsTradingMarketOrderbookRecord
            v-for="(sell, index) in sellsWithDepth"
            :key="`order-book-sell-${
              sell.aggregatedPrice || sell.price
            }-${aggregation}`"
            ref="sellRecordListRef"
            class="bg-gray-750 bg-opacity-20 hover:bg-purple-200 hover:bg-opacity-5"
            :class="{
              active: sellHoverPosition !== null && index >= sellHoverPosition
            }"
            v-bind="{
              market,
              position: index,
              aggregation,
              type: OrderSide.Sell,
              userOrders: sellUserOrderPrices,
              record: sell
            }"
            :position="index"
            :aggregation="aggregation"
            :type="OrderSide.Sell"
            :user-orders="sellUserOrderPrices"
            :record="sell"
            data-cy="orderbook-sell-list-item"
            @update:active-position="handleSellOrderHover"
          />
        </ul>
      </div>
    </div>

    <div
      class="orderbook-middle-h bg-gray-1000 flex flex-col items-center justify-center border-t border-b"
    >
      <div class="w-full flex items-center justify-center">
        <span
          v-if="!isSpot"
          :class="{
            'text-red-500': lastTradedPriceChange === Change.Decrease,
            'text-green-500': lastTradedPriceChange !== Change.Decrease
          }"
          data-cy="orderbook-last-traded-price-text-content"
          class="font-bold font-mono text-base lg:text-lg 4xl:text-xl"
        >
          {{ lastTradedPriceToFormat }}
        </span>
        <BaseIcon
          v-if="
            [Change.Increase, Change.Decrease].includes(lastTradedPriceChange)
          "
          name="arrow"
          class="transform w-3 h-3 lg:w-4 lg:h-4 4xl:w-5 4xl:h-5"
          :class="{
            'text-red-500 -rotate-90':
              lastTradedPriceChange === Change.Decrease,
            'text-green-500 rotate-90':
              lastTradedPriceChange === Change.Increase,
            'ml-2 mr-4': !isSpot
          }"
        />
        <span
          v-if="isSpot"
          :class="{
            'text-red-500': lastTradedPriceChange === Change.Decrease,
            'text-green-500': lastTradedPriceChange !== Change.Decrease
          }"
          class="font-bold font-mono text-base lg:text-lg 4xl:text-xl"
          data-cy="orderbook-last-traded-price-text-content"
        >
          {{ lastTradedPriceToFormat }}
        </span>

        <CommonInfoTooltip
          v-if="!isSpot"
          :tooltip="$t('trade.mark_price_tooltip_verbose')"
          data-cy="orderbook-mark-price-text-content"
        >
          <span
            class="text-gray-500 underline font-mono text-base lg:text-sm 4xl:text-md cursor-pointer mx-2"
          >
            {{ markPriceToFormat }}
          </span>
        </CommonInfoTooltip>
      </div>
    </div>

    <div
      v-if="appStore.userState.orderbookLayout !== OrderbookLayout.Sells"
      ref="buyOrdersContainerRef"
      v-scroll="hidePopperOnScroll"
      class="overflow-y-scroll overflow-x-hidden w-full"
      :class="{
        'orderbook-half-h':
          appStore.userState.orderbookLayout !== OrderbookLayout.Buys,
        'orderbook-full-h':
          appStore.userState.orderbookLayout === OrderbookLayout.Buys
      }"
    >
      <div class="flex h-full w-full">
        <ul
          class="list-order-book w-full mb-auto"
          @mouseenter="autoScrollBuysLocked = true"
          @mouseleave="autoScrollBuysLocked = false"
        >
          <!-- TODO: test the dynamic ref assignment -->
          <PartialsTradingMarketOrderbookRecord
            v-for="(buy, index) in buysWithDepth"
            :key="`order-book-buy-${
              buy.aggregatedPrice || buy.price
            }-${aggregation}`"
            ref="buyRecordListRef"
            class="bg-gray-750 bg-opacity-20 hover:bg-purple-200 hover:bg-opacity-5"
            :class="{
              active: buyHoverPosition !== null && index <= buyHoverPosition
            }"
            v-bind="{
              aggregation,
              market,
              position: index,
              record: buy,
              type: OrderSide.Buy,
              userOrders: buyUserOrderPrices
            }"
            data-cy="orderbook-buy-list-item"
            @update:active-position="handleBuyOrderHover"
          />
        </ul>
      </div>
    </div>
  </div>

  <!-- orderbook summary popup -->
  <div ref="orderbookSummaryRef" class="orderbook-summary">
    <PartialsTradingMarketOrderbookSummaryPopup
      v-if="orderBookSummary"
      :market="market"
      :summary="orderBookSummary"
    />
  </div>
</template>
