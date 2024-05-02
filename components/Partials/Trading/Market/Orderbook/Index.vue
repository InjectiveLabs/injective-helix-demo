<script lang="ts" setup>
import { vScroll } from '@vueuse/components'
import { createPopperLite } from '@popperjs/core'
import type { UseScrollReturn } from '@vueuse/core'
import { OrderSide } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { Instance, OptionsGeneric } from '@popperjs/core/lib/types'
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { SpotLimitOrder, DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { QUOTE_DENOMS_TO_SHOW_USD_VALUE } from '@/app/data/market'
import { computeOrderbookSummary as computeOrderbookSummarySpot } from '@/app/client/utils/spot'
import { computeOrderbookSummary as computeOrderbookSummaryDerivative } from '@/app/client/utils/derivatives'
import {
  TradingLayout,
  OrderbookLayout,
  UiMarketWithToken,
  UiAggregatedPriceLevel
} from '@/types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  aggregation: {
    type: Number,
    required: true
  },

  midPrice: {
    type: String,
    required: true
  },

  aggregatedSellOrders: {
    type: Object as PropType<
      Record<string, { quantity: string; total: string }>
    >,
    required: true,
    default: () => ({})
  },

  aggregatedBuyOrders: {
    type: Object as PropType<
      Record<string, { quantity: string; total: string }>
    >,
    required: true,
    default: () => ({})
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === SharedMarketType.Spot

const subaccountOrders = computed<Array<SpotLimitOrder | DerivativeLimitOrder>>(
  () => (isSpot ? spotStore.subaccountOrders : derivativeStore.subaccountOrders)
)

const autoScrollSellsLocked = ref(false)
const autoScrollBuysLocked = ref(false)
const buyHoverPosition = ref<number | undefined>(undefined)
const sellHoverPosition = ref<number | undefined>(undefined)

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
    decimalPlaces: props.market.priceDecimals,
    minimalDecimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: markPriceToFormat } = useBigNumberFormatter(
  computed(() => markPrice.value),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: spotLastTradedPriceInUsdToString } =
  useBigNumberFormatter(
    computed(() =>
      new BigNumberInBase(
        tokenStore.tokenUsdPrice(props.market.quoteToken)
      ).times(spotLastTradedPrice.value)
    ),
    {
      decimalPlaces: props.market.priceDecimals,
      minimalDecimalPlaces: props.market.priceDecimals
    }
  )

const userOrderbookLayout = computed(
  () => appStore.userState.preferences.orderbookLayout
)
const userTradingLayout = computed(
  () => appStore.userState.preferences.tradingLayout
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

const buysTotalNotional = computed(() => {
  const threshold = new BigNumberInBase(1).minus(
    new BigNumberInBase(20).div(100)
  )

  const filteredBuysWithoutLast = Object.entries(
    props.aggregatedBuyOrders
  ).slice(0, -1)

  const filteredBuys = filteredBuysWithoutLast
    .filter(([price]) => {
      return new BigNumberInWei(price).div(props.midPrice).gte(threshold)
    })
    .sort((a, b) => {
      const [, aQuantityAndTotal] = a
      const [, bQuantityAndTotal] = b

      return new BigNumberInBase(bQuantityAndTotal.total)
        .minus(aQuantityAndTotal.total)
        .toNumber()
    })

  if (filteredBuys.length === 0) {
    return ZERO_IN_BASE
  }

  const [highestNotionalBuy] = filteredBuys
  const [, highestNotionalBuyQuantityAndTotal] = highestNotionalBuy

  return new BigNumberInWei(highestNotionalBuyQuantityAndTotal.total).toFixed()
})

const sellsHighestBaseQuantity = computed(() => {
  const threshold = new BigNumberInBase(1).minus(
    new BigNumberInBase(20).div(100)
  )

  const filteredSellsWithoutLast = Object.entries(
    props.aggregatedSellOrders
  ).slice(0, -1)

  const filteredSells = filteredSellsWithoutLast
    .filter(([price]) => {
      return new BigNumberInBase(props.midPrice).div(price).gte(threshold)
    })
    .sort((a, b) => {
      const [, aTotalAndQuantity] = a
      const [, bQuantityAndTotal] = b

      return new BigNumberInBase(bQuantityAndTotal.quantity)
        .minus(aTotalAndQuantity.quantity)
        .toNumber()
    })

  if (filteredSells.length === 0) {
    return ZERO_IN_BASE.toFixed()
  }

  const [highestSell] = filteredSells
  const [, highestSellQuantity] = highestSell

  return highestSellQuantity.quantity
})

const buysWithDepth = computed(() => {
  return Object.entries(props.aggregatedBuyOrders).map(
    ([price, quantityAndTotal]) => {
      return {
        price,
        ...quantityAndTotal,
        depth: new BigNumberInBase(quantityAndTotal.total)
          .dividedBy(buysTotalNotional.value)
          .times(100)
          .toNumber()
      } as UiAggregatedPriceLevel
    }
  )
})

const buyOrdersSummary = computed<
  { quantity: string; total: string } | undefined
>(() => {
  if (
    buysWithDepth.value.length === 0 ||
    buyHoverPosition.value === undefined
  ) {
    return
  }

  if (isSpot) {
    const buyOrdersSummary = buysWithDepth.value
      .slice(0, Number(buyHoverPosition.value) + 1)
      .reduce(computeOrderbookSummarySpot, {
        quantity: new BigNumberInWei(0).toFixed(),
        total: new BigNumberInBase(0).toFixed()
      })

    return {
      ...buyOrdersSummary,
      quantity: new BigNumberInWei(buyOrdersSummary.quantity).toFixed()
    }
  }

  return buysWithDepth.value
    .slice(0, Number(buyHoverPosition.value) + 1)
    .reduce(computeOrderbookSummaryDerivative, {
      quantity: new BigNumberInBase(0).toFixed(),
      total: new BigNumberInBase(0).toFixed()
    })
})

const sellsWithDepth = computed(() => {
  return Object.entries(props.aggregatedSellOrders)
    .map(([price, quantityAndTotal]) => {
      return {
        price,
        ...quantityAndTotal,
        depth: new BigNumberInWei(quantityAndTotal.quantity)
          .dividedBy(sellsHighestBaseQuantity.value)
          .times(100)
          .toNumber()
      } as UiAggregatedPriceLevel
    })
    .reverse()
})

const sellOrdersSummary = computed<
  { quantity: string; total: string } | undefined
>(() => {
  if (
    sellsWithDepth.value.length === 0 ||
    sellHoverPosition.value === undefined
  ) {
    return
  }

  if (isSpot) {
    const sellOrdersSummary = sellsWithDepth.value
      .slice(Number(sellHoverPosition.value))
      .reduce(computeOrderbookSummarySpot, {
        quantity: new BigNumberInWei(0).toFixed(),
        total: new BigNumberInBase(0).toFixed()
      })

    const quantity = new BigNumberInWei(sellOrdersSummary.quantity).toFixed()

    return {
      ...sellOrdersSummary,
      quantity
    }
  }

  return sellsWithDepth.value
    .slice(Number(sellHoverPosition.value))
    .reduce(computeOrderbookSummaryDerivative, {
      quantity: new BigNumberInBase(0).toFixed(),
      total: new BigNumberInBase(0).toFixed()
    })
})

const orderBookSummary = computed(() => {
  if (buyHoverPosition.value !== undefined) {
    return buyOrdersSummary.value
  }

  if (sellHoverPosition.value !== undefined) {
    return sellOrdersSummary.value
  }

  return undefined
})

const popperOptions = computed<Partial<OptionsGeneric<any>>>(() => ({
  placement: userTradingLayout.value === TradingLayout.Right ? 'left' : 'right'
}))

watch(
  () => props.aggregatedBuyOrders,
  () =>
    nextTick(() => {
      onScrollSells()
      onScrollBuys()
    })
)

watch(
  () => props.aggregatedSellOrders,
  () =>
    nextTick(() => {
      onScrollSells()
      onScrollBuys()
    })
)

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

function onSellOrderHover(position?: number) {
  sellHoverPosition.value = position

  if (position !== undefined) {
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

function onBuyOrderHover(position?: number) {
  buyHoverPosition.value = position

  if (position !== undefined) {
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
  if (!orderbookSummaryRef.value) {
    return
  }

  if (
    buyHoverPosition.value === undefined &&
    sellHoverPosition.value === undefined
  ) {
    return
  }

  if (state.isScrolling.value) {
    orderbookSummaryRef.value.removeAttribute('data-show')
  } else {
    orderbookSummaryRef.value.setAttribute('data-show', '')
  }
}
</script>

<template>
  <div class="flex flex-col flex-wrap overflow-y-hidden w-full px-2">
    <div
      v-if="userOrderbookLayout !== OrderbookLayout.Buys"
      ref="sellOrdersContainerRef"
      v-scroll="hidePopperOnScroll"
      class="overflow-y-scroll overflow-x-hidden w-full"
      :class="{
        'orderbook-half-h': userOrderbookLayout !== OrderbookLayout.Sells,
        'orderbook-full-h': userOrderbookLayout === OrderbookLayout.Sells
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
            :key="`order-book-sell-${sell.price}-${sell.quantity}-${aggregation}`"
            ref="sellRecordListRef"
            class="bg-gray-750 bg-opacity-20 hover:bg-purple-200 hover:bg-opacity-5"
            :class="{
              active: sellHoverPosition && index >= sellHoverPosition
            }"
            v-bind="{
              market,
              aggregation,
              record: sell,
              position: index,
              type: OrderSide.Sell,
              userOrders: sellUserOrderPrices,
              isLast: index === 0
            }"
            data-cy="orderbook-sell-list-item"
            @update:active-position="onSellOrderHover"
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
            'text-red-500':
              lastTradedPriceChange === SharedMarketChange.Decrease,
            'text-green-500':
              lastTradedPriceChange !== SharedMarketChange.Decrease
          }"
          data-cy="orderbook-last-traded-price-text-content"
          class="font-bold font-mono text-base lg:text-lg 4xl:text-xl"
        >
          {{ lastTradedPriceToFormat }}
        </span>

        <span
          v-if="isSpot"
          :class="{
            'text-red-500':
              lastTradedPriceChange === SharedMarketChange.Decrease,
            'text-green-500':
              lastTradedPriceChange !== SharedMarketChange.Decrease
          }"
          class="font-bold font-mono text-base lg:text-lg 4xl:text-xl"
          data-cy="orderbook-last-traded-price-text-content"
        >
          {{ lastTradedPriceToFormat }}
        </span>

        <BaseIcon
          v-if="
            [SharedMarketChange.Increase, SharedMarketChange.Decrease].includes(
              lastTradedPriceChange
            )
          "
          name="arrow"
          class="transform w-3 h-3 lg:w-4 lg:h-4 4xl:w-5 4xl:h-5"
          :class="{
            'text-red-500 -rotate-90':
              lastTradedPriceChange === SharedMarketChange.Decrease,
            'text-green-500 rotate-90':
              lastTradedPriceChange === SharedMarketChange.Increase,
            'ml-2 mr-4': !isSpot
          }"
        />

        <span
          v-if="
            isSpot &&
            QUOTE_DENOMS_TO_SHOW_USD_VALUE.includes(market.quoteToken.denom)
          "
          class="text-xs font-bold text-gray-475 ml-1"
        >
          ${{ spotLastTradedPriceInUsdToString }}
        </span>

        <AppTooltip
          v-if="!isSpot"
          :content="$t('trade.mark_price_tooltip_verbose')"
          data-cy="orderbook-mark-price-text-content"
        >
          <span
            class="text-gray-500 underline font-mono text-base lg:text-sm 4xl:text-md cursor-pointer mx-2"
          >
            {{ markPriceToFormat }}
          </span>
        </AppTooltip>
      </div>
    </div>

    <div
      v-if="userOrderbookLayout !== OrderbookLayout.Sells"
      ref="buyOrdersContainerRef"
      v-scroll="hidePopperOnScroll"
      class="overflow-y-scroll overflow-x-hidden w-full"
      :class="{
        'orderbook-half-h': userOrderbookLayout !== OrderbookLayout.Buys,
        'orderbook-full-h': userOrderbookLayout === OrderbookLayout.Buys
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
            :key="`order-book-buy-${buy.price}-${buy.quantity}-${aggregation}`"
            ref="buyRecordListRef"
            class="bg-gray-750 bg-opacity-20 hover:bg-purple-200 hover:bg-opacity-5"
            :class="{
              active: buyHoverPosition && index <= buyHoverPosition
            }"
            v-bind="{
              market,
              aggregation,
              record: buy,
              position: index,
              type: OrderSide.Buy,
              userOrders: buyUserOrderPrices,
              isLast: index === buysWithDepth.length - 1
            }"
            data-cy="orderbook-buy-list-item"
            @update:active-position="onBuyOrderHover"
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
