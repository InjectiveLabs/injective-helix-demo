<script lang="ts" setup>
import { PropType } from 'vue'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  Change,
  MarketType,
  UiOrderbookPriceLevel
} from '@injectivelabs/sdk-ui-ts'
import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ts'
import {
  BusEvents,
  OrderBookPriceAndType,
  OrderBookQuantityAndType,
  OrderBookNotionalAndType,
  UiMarketWithToken
} from '@/types'
import { UI_MINIMAL_ABBREVIATION_FLOOR } from '@/app/utils/constants'

const props = defineProps({
  aggregation: {
    type: Number,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  position: {
    required: true,
    type: Number
  },

  record: {
    required: true,
    type: Object as PropType<UiOrderbookPriceLevel>
  },

  type: {
    required: true,
    type: String as PropType<DerivativeOrderSide | SpotOrderSide>
  },

  userOrders: {
    required: true,
    type: Array as PropType<Array<string>>
  }
})

const emit = defineEmits<{
  (e: 'update:active-position', position: number | null): void
}>()

const isSpot = props.market.type === MarketType.Spot

const element = ref()

const existsInUserOrders = computed(() =>
  props.userOrders.some((price) => {
    if (!props.record.aggregatePrices) {
      return false
    }

    return props.record.aggregatePrices.includes(price)
  })
)

const recordTypeBuy = computed(
  () =>
    props.type === DerivativeOrderSide.Buy || props.type === SpotOrderSide.Buy
)

const total = computed(() => new BigNumberInBase(props.record.total || 0))

const quantity = computed(() =>
  isSpot
    ? new BigNumberInWei(props.record.quantity).toBase(
        props.market.baseToken.decimals
      )
    : new BigNumberInBase(props.record.quantity)
)

const depthWidth = computed(() => ({
  width: `${props.record.depth}%`
}))

const newRecordClass = computed(() => {
  switch (quantityChange.value) {
    case Change.NoChange:
      return ''
    case Change.New:
      return recordTypeBuy.value ? 'green-record-bg' : 'red-record-bg'
    case Change.Increase:
      return 'green-record-bg'
    case Change.Decrease:
      return 'red-record-bg'
    default:
      return ''
  }
})

const quantityChange = computed(() => {
  const { oldQuantity, quantity } = props.record

  const oldQuantityBN = new BigNumber(oldQuantity || 0)
  const quantityBN = new BigNumber(quantity)

  if (oldQuantityBN.isNaN()) {
    return Change.NoChange
  }

  if (oldQuantityBN.eq(0)) {
    return Change.New
  }

  if (oldQuantityBN.eq(quantityBN)) {
    return Change.NoChange
  }

  return oldQuantityBN.gte(quantityBN) ? Change.Decrease : Change.Increase
})

const aggregatedValue = computed(() => {
  const value = new BigNumberInBase(10 ** Math.abs(props.aggregation))

  return props.aggregation < 0 ? value : new BigNumberInBase(1).dividedBy(value)
})

const aggregatedPriceInBigNumber = computed(
  () => new BigNumberInBase(props.record.aggregatedPrice || 0)
)

function onPriceClick() {
  if (props.record.aggregatedPrice) {
    useEventBus<OrderBookPriceAndType>(BusEvents.OrderbookPriceClick).emit({
      isBuy: recordTypeBuy.value,
      price: props.record.aggregatedPrice
    })
  }
}

function onSizeClick() {
  useEventBus<OrderBookQuantityAndType>(BusEvents.OrderbookSizeClick).emit({
    isBuy: recordTypeBuy.value,
    quantity: quantity.value.toFixed()
  })
}

function onNotionalClick() {
  useEventBus<OrderBookNotionalAndType>(BusEvents.OrderbookNotionalClick).emit({
    isBuy: recordTypeBuy.value,
    quantity: quantity.value.toFixed(),
    total: total.value.toFixed()
  })
}

function handleMouseEnter() {
  emit('update:active-position', props.position)
}

function handleMouseLeave() {
  emit('update:active-position', null)
}

defineExpose({
  element
})
</script>

<template>
  <li
    ref="element"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer w-full overflow-hidden"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="size-col" :class="newRecordClass"></span>
    <span
      class="depth-col"
      :style="depthWidth"
      :class="recordTypeBuy ? 'buys-green-bg' : 'sells-red-bg'"
    ></span>
    <span
      class="w-1/3 text-xs px-2 flex items-center justify-end z-[8]"
      @click.stop="onPriceClick"
    >
      <BaseIcon
        v-if="existsInUserOrders"
        name="arrow"
        data-cy="orderbook-record-own-order-icon"
        class="text-gray-300 transform rotate-180 mr-2 w-2 h-2"
      />
      <span
        class="block text-right font-mono"
        :class="{
          'text-green-500': recordTypeBuy,
          'text-red-500': !recordTypeBuy
        }"
      >
        <AppNumber
          xs
          :prefix="
            aggregatedValue.gt(record.aggregatedPrice || 0) && recordTypeBuy
              ? '<'
              : ''
          "
          :decimals="aggregation < 0 ? 0 : aggregation"
          :number="
            aggregatedValue.gt(record.aggregatedPrice || 0)
              ? aggregatedValue
              : aggregatedPriceInBigNumber
          "
          no-grouping
          data-cy="orderbook-record-price-text-content"
        />
      </span>
    </span>
    <span class="w-1/3 text-xs px-2 z-[8]" @click.stop="onSizeClick">
      <span
        class="block text-right font-mono"
        :class="{
          'text-red-500': quantityChange === Change.Decrease,
          'text-green-500': quantityChange === Change.Increase
        }"
      >
        <AppNumber
          xs
          :decimals="market.quantityDecimals"
          :number="quantity"
          :abbreviation-floor="UI_MINIMAL_ABBREVIATION_FLOOR"
          no-grouping
          data-cy="orderbook-record-quantity-text-content"
        />
      </span>
    </span>
    <span
      class="w-1/3 text-xs px-2 font-mono text-right z-[8]"
      @click.stop="onNotionalClick"
    >
      <AppNumber
        xs
        :decimals="market.priceDecimals"
        :number="total"
        no-grouping
        data-cy="orderbook-record-total-text-content"
      />
    </span>
  </li>
</template>
<style scoped>
.size-col {
  @apply absolute right-0 text-xs font-mono top-0 invisible;
  height: 100%;
  width: calc(100%);
}

.size-col.green-record-bg {
  @apply visible;
  fill: theme('colors.green.500');
  opacity: 0.35;
  animation: sizeColUp 0.5s ease-in-out;
  color: rgb(255, 255, 255) !important;
}

.size-col.red-record-bg {
  @apply visible;
  fill: theme('colors.red.500');
  opacity: 0.35;
  animation: sizeColDown 0.5s ease-in-out;
  color: rgb(255, 255, 255) !important;
}

.depth-col {
  @apply absolute right-0 top-0 h-full;
}

.depth-col.buys-green-bg {
  background: theme('colors.green.500');
  opacity: 0.2;
}

.depth-col.sells-red-bg {
  background: theme('colors.red.500');
  opacity: 0.2;
}

@keyframes sizeColUp {
  0% {
    background-color: rgba(#0ee29b, 0.35);
  }
  100% {
    background-color: unset;
  }
}

@keyframes sizeColDown {
  0% {
    background-color: rgba(#f3164d, 0.35);
  }
  100% {
    background-color: unset;
  }
}
</style>
