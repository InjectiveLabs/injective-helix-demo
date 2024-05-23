<script setup lang="ts">
import { Position, PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { ClosePositionLimitForm, ClosePositionLimitFormField } from '@/types'

const props = defineProps({
  position: {
    type: Object as PropType<PositionV2 | Position>,
    required: true
  }
})

const emit = defineEmits<{
  'margin:add': [position: Position | PositionV2]
  'tpsl:add': [position: Position | PositionV2]
}>()

const { validate } = useForm<ClosePositionLimitForm>()

const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()
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
  liquidationPrice,
  quantityDecimals,
  effectiveLeverage
} = useDerivativePosition(computed(() => props.position))

const { success, error } = useNotifications()
const { t } = useLang()

const marketCloseStatus = reactive(new Status(StatusType.Idle))
const limitCloseStatus = reactive(new Status(StatusType.Idle))

const reduceOnlyCurrentOrders = computed(() =>
  derivativeStore.subaccountOrders.filter(
    (order) => order.isReduceOnly && order.marketId === props.position.marketId
  )
)

const hasReduceOnlyOrders = computed(
  () => reduceOnlyCurrentOrders.value.length > 0
)

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

const { value: priceValue } = useStringField({
  name: ClosePositionLimitFormField.Price,
  initialValue: ''
})

const { value: quantityValue } = useStringField({
  name: ClosePositionLimitFormField.Quantity,
  initialValue: ''
})

function closePositionClicked() {
  if (!market.value) {
    return
  }

  if (pnl.value.isNaN()) {
    return error({ title: t('trade.no_liquidity') })
  }

  if (hasReduceOnlyOrders.value) {
    return closePositionAndReduceOnlyOrders()
  }

  closePosition()
}

function closePosition() {
  if (!market.value) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePosition({
      position: props.position,
      market: market.value
    })
    .then(() => {
      success({ title: t('trade.position_closed') })
    })
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}

function closePositionAndReduceOnlyOrders() {
  if (!market.value) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePositionAndReduceOnlyOrders({
      market: market.value,
      position: props.position,
      reduceOnlyOrders: reduceOnlyCurrentOrders.value
    })
    .then(() => {
      success({ title: t('trade.position_closed') })
    })
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}

async function closePositionLimit() {
  const { valid } = await validate()

  if (!market.value || !valid) {
    return
  }
  limitCloseStatus.setLoading()

  derivativeStore
    .submitLimitOrder({
      margin: ZERO_IN_BASE,
      market: market.value,
      price: new BigNumberInBase(priceValue.value),
      quantity: new BigNumberInBase(quantityValue.value),
      reduceOnly: true,
      orderSide:
        props.position.direction === TradeDirection.Long
          ? OrderSide.SellPO
          : OrderSide.BuyPO
    })
    .then(() => {
      success({ title: t('common.success') })
    })
    .catch($onError)
    .finally(() => {
      limitCloseStatus.setIdle()
    })
}

function addMargin() {
  emit('margin:add', props.position)
}

function addTpSl() {
  emit('tpsl:add', props.position)
}
</script>

<template>
  <div class="p-2 text-xs divide-y">
    <div v-if="market" class="flex items-center space-x-2 px-2 py-4 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="flex items-center justify-between px-2 py-4">
      <p>{{ $t('trade.side') }}</p>
      <span
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ $t(`trade.${position.direction}`) }}
      </span>
    </div>

    <div class="flex-1 flex items-center px-2 py-4 justify-between">
      <p>{{ $t('trade.amount') }}</p>
      <div v-if="market" class="space-y-1 font-mono">
        <p>{{ quantityToString }} {{ market.baseToken.symbol }}</p>
      </div>
    </div>

    <div class="flex justify-between">
      <div class="space-y-1 p-2 flex items-center">
        <p>{{ $t('trade.entryMark') }}</p>
      </div>

      <div class="space-y-1 p-2">
        <p>{{ priceToString }}</p>
        <p class="text-gray-500">{{ markPriceToString }}</p>
      </div>
    </div>

    <div class="flex justify-between">
      <div class="space-y-1 p-2 flex items-center">
        <p>{{ $t('portfolio.balances.unrealizedPnl') }}</p>
      </div>

      <div class="flex items-center p-2">
        <div
          class="space-y-1 text-right"
          :class="{
            'text-green-500': pnl.gte(0),
            'text-red-500': pnl.lt(0)
          }"
        >
          <p>{{ pnlToString }} {{ market?.quoteToken.symbol }}</p>
          <p>{{ percentagePnlToString }}%</p>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center px-2 py-4">
      <p>{{ $t('portfolio.balances.totalValueUsd') }}</p>

      <div v-if="market" class="space-y-1">
        <p>${{ quantityInUsdToString }}</p>
      </div>
    </div>

    <div class="flex justify-between items-center px-2 py-4">
      <p>{{ $t('trade.margin') }}</p>

      <div class="space-x-2">
        <span>{{ marginToString }}</span>
        <button class="p-2 rounded-full bg-gray-800" @click="addMargin">
          <BaseIcon name="plus" is-xs />
        </button>
      </div>
    </div>

    <div class="flex items-center px-2 py-4 justify-between">
      <p>{{ $t('trade.liquidation_price') }}</p>
      <p>{{ liquidationPrice.toFormat(2) }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.leverage') }}</p>
      <p>{{ effectiveLeverage.toFormat(2) }}x</p>
    </div>

    <div class="flex-1 flex items-center px-2 py-4">
      <AppButton variant="primary-outline" class="w-full" @click="addTpSl">
        {{ $t('trade.addTpSl') }}
      </AppButton>
    </div>

    <div class="flex-[3] flex items-center p-2 overflow-hidden space-x-2">
      <AppButton
        v-bind="{ status: marketCloseStatus }"
        size="sm"
        variant="danger-ghost"
        class="min-w-20"
        @click="closePositionClicked"
      >
        {{ $t('trade.market') }}
      </AppButton>

      <AppButton
        v-bind="{
          status: limitCloseStatus
        }"
        class="min-w-20"
        size="sm"
        variant="danger-ghost"
        @click="closePositionLimit"
      >
        {{ $t('trade.limit') }}
      </AppButton>

      <AppInputBase
        v-bind="{
          max: quantity.toNumber()
        }"
        v-model="quantityValue"
        autofix
        class="p-1 rounded min-w-0 border"
        placeholder="Qty"
      />
      <AppInputBase
        v-model="priceValue"
        class="p-1 rounded min-w-0 border"
        placeholder="Price"
      />
    </div>
  </div>
</template>
