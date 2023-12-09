<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { Change } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  BusEvents,
  OrderBookPriceAndType,
  OrderBookQuantityAndType,
  OrderBookNotionalAndType,
  UiMarketWithToken,
  UiAggregatedPriceLevel
} from '@/types'
import { UI_MINIMAL_ABBREVIATION_FLOOR } from '@/app/utils/constants'

const props = defineProps({
  isLast: Boolean,

  aggregation: {
    type: Number,
    required: true
  },

  position: {
    required: true,
    type: Number
  },

  type: {
    required: true,
    type: String as PropType<OrderSide>
  },

  userOrders: {
    required: true,
    type: Array as PropType<string[]>
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  record: {
    required: true,
    type: Object as PropType<UiAggregatedPriceLevel>
  }
})

const emit = defineEmits<{
  'update:active-position': [position?: number]
}>()

const element = ref()

const existsInUserOrders = computed(() =>
  props.userOrders.some((price) => {
    if (!props.record.price) {
      return false
    }

    return props.record.price.includes(price)
  })
)

const recordTypeBuy = computed(() => props.type === OrderSide.Buy)

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
  () => new BigNumberInBase(props.record.price || 0)
)

function onPriceClick() {
  if (props.record.price) {
    useEventBus<OrderBookPriceAndType>(BusEvents.OrderbookPriceClick).emit({
      isBuy: recordTypeBuy.value,
      price: props.record.price
    })
  }
}

function onSizeClick() {
  useEventBus<OrderBookQuantityAndType>(BusEvents.OrderbookSizeClick).emit({
    isBuy: recordTypeBuy.value,
    quantity: props.record.quantity
  })
}

function onNotionalClick() {
  useEventBus<OrderBookNotionalAndType>(BusEvents.OrderbookNotionalClick).emit({
    isBuy: recordTypeBuy.value,
    quantity: props.record.quantity,
    total: props.record.total
  })
}

function mouseEnter() {
  if (props.isLast) {
    return
  }

  emit('update:active-position', props.position)
}

function mouseLeave() {
  emit('update:active-position')
}

defineExpose({
  element
})
</script>

<template>
  <li
    ref="element"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer w-full overflow-hidden"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
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
        class="text-gray-300 rotate-180 mr-2 w-2 h-2"
      />
      <span
        class="text-right font-mono flex items-center"
        :class="{
          'text-green-500': recordTypeBuy,
          'text-red-500': !recordTypeBuy
        }"
      >
        <span v-if="isLast && recordTypeBuy">&le;</span>
        <span v-if="isLast && !recordTypeBuy">&ge;</span>
        <AppNumber
          is-xs
          :decimals="aggregation < 0 ? 0 : aggregation"
          :number="
            aggregatedValue.gt(record.price || 0)
              ? aggregatedValue
              : aggregatedPriceInBigNumber
          "
          is-no-grouping
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
          is-xs
          :decimals="market.quantityDecimals"
          :number-string="record.quantity"
          :abbreviation-floor="UI_MINIMAL_ABBREVIATION_FLOOR"
          is-no-grouping
          data-cy="orderbook-record-quantity-text-content"
        />
      </span>
    </span>
    <span
      class="w-1/3 text-xs px-2 font-mono text-right z-[8]"
      @click.stop="onNotionalClick"
    >
      <AppNumber
        is-xs
        :decimals="market.priceDecimals"
        :number-string="record.total"
        is-no-grouping
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
