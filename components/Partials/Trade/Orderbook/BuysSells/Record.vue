<script setup lang="ts">
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MAX_DECIMALS } from '@/app/utils/constants'
import { IsSpotKey, BusEvents, MarketKey, AggregationKey } from '@/types'
import type { UiMarketWithToken } from '@/types'
import type { OrderbookFormattedRecord } from '@/types/worker'

const props = withDefaults(
  defineProps<{
    index?: number
    isBuy?: boolean
    isActive?: boolean
    highestVolume: string
    record: OrderbookFormattedRecord
  }>(),
  {
    index: -1
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

const price = computed(() => {
  if (aggregation.value < 0) {
    return new BigNumberInBase(props.record.price).times(
      new BigNumberInBase(10).exponentiatedBy(-aggregation.value)
    )
  }

  return props.record.price
})

const priceDecimals = computed(() =>
  props.record.price.split('.')[1]?.length
    ? props.record.price.split('.')[1].length
    : 0
)

const { valueToFixed: priceToFixed } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const recordQuantityDecimals = computed(() =>
  sharedGetExactDecimalsFromNumber(props.record.quantity)
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
    const isCurrentMarket = market.value.marketId === order.marketId

    if (!isCurrentMarket) {
      return
    }

    const orderMarket =
      spotStore.marketByIdOrSlug(order.marketId) ||
      derivativeStore.marketByIdOrSlug(order.marketId)

    const priceInBase = sharedToBalanceInTokenInBase({
      value: order.price,
      decimalPlaces: isSpot
        ? (orderMarket?.quoteToken?.decimals || DEFAULT_ASSET_DECIMALS) -
          (orderMarket?.baseToken?.decimals || UI_DEFAULT_MAX_DECIMALS)
        : orderMarket?.quoteToken.decimals || DEFAULT_ASSET_DECIMALS
    })

    const isSameSide = order.orderSide === (props.isBuy ? 'buy' : 'sell')

    return (
      isSameSide &&
      priceInBase
        .dp(getDecimals(props.record.price), BigNumber.ROUND_CEIL)
        .isEqualTo(priceToFixed.value)
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
  const formattedPrice =
    aggregation.value < 0
      ? new BigNumberInBase(props.record.price)
          .times(new BigNumberInBase(10).exponentiatedBy(-aggregation.value))
          .toFixed()
      : props.record.price

  useEventBus(BusEvents.OrderbookPriceClick).emit(formattedPrice)
}
</script>

<template>
  <div
    class="group flex text-xs py-1 leading-4 relative text-coolGray-300 hover:text-white cursor-pointer select-none"
    :class="{ 'bg-brand-800': isActive }"
    @mouseenter="setIndex"
  >
    <div
      class="absolute hidden lg:group-hover:block left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-900 border z-20 text-white"
    >
      <div
        class="text-xs font-sans whitespace-nowrap text-left grid grid-cols-[auto_auto] gap-x-4 gap-y-1"
      >
        <div class="text-coolGray-300 font-2xs">{{ $t('trade.volume') }}:</div>
        <div class="text-right">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              amount: record.volume,
              shouldAbbreviate: false,
              decimals: market.priceDecimals
            }"
          />
        </div>

        <div class="text-coolGray-300 font-2xs">
          {{ $t('trade.totalVolume', { symbol: market.quoteToken.symbol }) }}:
        </div>
        <div class="text-right">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: record.totalVolume,
              decimals: market.priceDecimals
            }"
          />
        </div>

        <div class="text-coolGray-300 font-2xs">
          {{ $t('trade.totalQuantity', { symbol: market.baseToken.symbol }) }}:
        </div>
        <div class="text-right">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: record.totalQuantity,
              decimals: market.quantityDecimals
            }"
          />
        </div>

        <div class="text-coolGray-300 font-2xs">
          {{ $t('trade.avgPrice') }}:
        </div>
        <div class="text-right">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              noTrailingZeros: false,
              shouldAbbreviate: false,
              amount: record.avgPrice,
              decimals: market.priceDecimals
            }"
          />
        </div>
      </div>
    </div>

    <div
      class="absolute right-px transition-all duration-500 rounded top-px bottom-px"
      :class="{
        'bg-red-700/50': isActive && !isBuy,
        'bg-red-500/25': !isActive && !isBuy,
        'bg-green-700/60': isActive && isBuy,
        'bg-green-500/25': !isActive && isBuy
      }"
      :style="{
        width: (Number(record.totalVolume) / Number(highestVolume)) * 100 + '%'
      }"
    />

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate pl-2 pr-1 relative"
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
      <span>
        <SharedAmount
          v-bind="{
            amount: price,
            useSubscript: true,
            noTrailingZeros: false,
            shouldAbbreviate: false,
            decimals: priceDecimals
          }"
        />
      </span>
    </div>

    <div
      :key="record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative text-center"
      :class="{
        [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
          showQuantityFlash,
        'font-bold': showQuantityFlash
      }"
      @animationend="setQuantityFlashOff"
      @click="handlePriceClick"
    >
      <SharedAmount
        v-bind="{
          useSubscript: true,
          amount: record.quantity,
          shouldAbbreviate: false,
          decimals: recordQuantityDecimals
        }"
      />
    </div>

    <div
      :key="record.price + record.quantity"
      class="flex-1 min-w-0 truncate pl-1 pr-2 relative text-right"
      @click="handlePriceClick"
    >
      <SharedAmount
        v-bind="{
          useSubscript: true,
          amount: record.volume,
          noTrailingZeros: false,
          shouldAbbreviate: false,
          decimals: market.priceDecimals
        }"
      />
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
