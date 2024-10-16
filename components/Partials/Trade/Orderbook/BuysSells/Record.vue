<script setup lang="ts">
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { OrderbookFormattedRecord } from '@/types/worker'
import {
  IsSpotKey,
  BusEvents,
  MarketKey,
  AggregationKey,
  UiMarketWithToken
} from '@/types'

const props = withDefaults(
  defineProps<{
    isBuy?: boolean
    index?: number
    record: OrderbookFormattedRecord
    isActive?: boolean
    highestVolume: string
  }>(),
  {
    isBuy: false,
    index: -1,
    isActive: false
  }
)

const aggregation = inject(AggregationKey, ref(1)) as Ref<number>

const emit = defineEmits<{
  'set:index': [index: number]
}>()

const isSpot = inject(IsSpotKey)
const market = inject(MarketKey) as Ref<UiMarketWithToken>

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const showPriceFlash = ref(false)
const showQuantityFlash = ref(false)

function setIndex() {
  emit('set:index', props.index)
}

function getDecimals(number: string) {
  return number.split('.')[1]?.length ? number.split('.')[1].length : 0
}

const { valueToString: totalVolumeToString } = useSharedBigNumberFormatter(
  computed(() => props.record.totalVolume),
  {
    decimalPlaces: market.value.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: volumeToString } = useSharedBigNumberFormatter(
  computed(() => props.record.volume),
  {
    decimalPlaces: market.value.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(
  computed(() => {
    if (aggregation.value < 0) {
      return new BigNumberInBase(props.record.price).times(
        new BigNumberInBase(10).exponentiatedBy(-aggregation.value)
      )
    } else {
      return props.record.price
    }
  }),
  {
    decimalPlaces: computed(() =>
      props.record.price.split('.')[1]?.length
        ? props.record.price.split('.')[1].length
        : 0
    ),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  computed(() => props.record.quantity),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.record.quantity)
    ),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: totalQuantityToString } = useSharedBigNumberFormatter(
  computed(() => props.record.totalQuantity),
  {
    decimalPlaces: market.value.quantityDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: avgPriceToString } = useSharedBigNumberFormatter(
  computed(() => props.record.avgPrice),
  {
    decimalPlaces: market.value.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

watch(
  () => props.record.price,
  () => {
    showPriceFlash.value = true
  }
)
watch(
  () => props.record.quantity,
  () => {
    showQuantityFlash.value = true
  }
)

const hasOrders = computed(() => {
  const orders = [
    ...spotStore.subaccountOrders,
    ...derivativeStore.subaccountOrders
  ]

  return orders.some((order) => {
    const market = [...spotStore.markets, ...derivativeStore.markets].find(
      ({ marketId }) => marketId === order.marketId
    )

    const priceInBase = new BigNumberInWei(Number(order.price)).toBase(
      isSpot
        ? (market?.quoteToken?.decimals || 6) -
            (market?.baseToken?.decimals || 18)
        : market?.quoteToken.decimals || 6
    )

    const isSameSide = order.orderSide === (props.isBuy ? 'buy' : 'sell')

    return (
      isSameSide &&
      priceInBase
        .dp(getDecimals(props.record.price), BigNumber.ROUND_CEIL)
        .isEqualTo(props.record.price)
    )
  })
})

function setPriceFlashOff() {
  showPriceFlash.value = false
}

function setQuantityFlashOff() {
  showQuantityFlash.value = false
}

function handlePriceClick() {
  useEventBus(BusEvents.OrderbookPriceClick).emit(props.record.price)
}
</script>

<template>
  <div
    class="group flex text-[11px] leading-4 text-right relative text-gray-300 hover:text-white cursor-pointer select-none font-mono"
    :class="{ 'bg-brand-800': isActive }"
    @mouseenter="setIndex"
  >
    <div
      class="absolute hidden lg:group-hover:block left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-900 border z-20 text-white"
    >
      <div
        class="text-xs font-sans whitespace-nowrap text-left grid grid-cols-[auto_auto] gap-x-4 gap-y-1"
      >
        <div class="text-gray-300 font-2xs">{{ $t('trade.volume') }}:</div>
        <div class="font-mono text-right">{{ volumeToString }}</div>

        <div class="text-gray-300 font-2xs">
          {{ $t('trade.totalVolume', { symbol: market.quoteToken.symbol }) }}:
        </div>
        <div class="font-mono text-right">{{ totalVolumeToString }}</div>

        <div class="text-gray-300 font-2xs">
          {{ $t('trade.totalQuantity', { symbol: market.baseToken.symbol }) }}:
        </div>
        <div class="font-mono text-right">{{ totalQuantityToString }}</div>

        <div class="text-gray-300 font-2xs">{{ $t('trade.avgPrice') }}:</div>
        <div class="font-mono text-right">{{ avgPriceToString }}</div>
      </div>
    </div>

    <div
      class="absolute right-px transition-all duration-500 rounded top-px bottom-px"
      :class="{
        'bg-red-700/50': isActive && !isBuy,
        'bg-red-500/10': !isActive && !isBuy,
        'bg-green-700/60': isActive && isBuy,
        'bg-green-500/10': !isActive && isBuy
      }"
      :style="{
        width: (Number(record.totalVolume) / Number(highestVolume)) * 100 + '%'
      }"
    />

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="[
        isBuy ? 'text-green-500' : 'text-red-500',
        {
          [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
            showPriceFlash,
          'font-bold': showPriceFlash
        }
      ]"
      @animationend="setPriceFlashOff"
      @click="handlePriceClick"
    >
      <div
        v-if="hasOrders"
        class="border-transparent border-4 absolute left-0 top-1 bottom-1 w-2"
        :class="{
          'border-l-green-500': isBuy,
          'border-l-red-500': !isBuy
        }"
      />
      <span>{{ priceToString }}</span>
    </div>

    <div
      :key="record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="{
        [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
          showQuantityFlash,
        'font-bold': showQuantityFlash
      }"
      @animationend="setQuantityFlashOff"
      @click="handlePriceClick"
    >
      {{ quantityToString }}
    </div>

    <div
      :key="record.price + record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative"
      @click="handlePriceClick"
    >
      {{ volumeToString }}
    </div>
  </div>

  <div class="green-300"></div>
</template>

<style>
@keyframes flash {
  0% {
    color: white;
  }

  100% {
    color: rgb(162, 162, 162);
  }
}

.flash-animation {
  animation: flash 0.2s forwards;
}

@keyframes flash-red {
  0% {
    color: rgb(248, 114, 148);
  }

  100% {
    color: rgb(243, 22, 77);
  }
}

.flash-animation-red {
  animation: flash-red 0.2s forwards;
}

@keyframes flash-green {
  0% {
    color: rgb(101, 245, 197);
  }

  100% {
    color: rgb(14, 226, 155);
  }
}

.flash-animation-green {
  animation: flash-green 0.2s forwards;
}
</style>
