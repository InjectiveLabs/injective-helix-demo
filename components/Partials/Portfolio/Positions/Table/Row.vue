<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { Position, PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  ClosePositionLimitForm,
  ClosePositionLimitFormField,
  PerpetualmarketCyTags
} from '@/types'

const authZStore = useAuthZStore()
const tokenStore = useTokenStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()
const { validate } = useForm<ClosePositionLimitForm>()

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

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  markPrice,
  priceDecimals,
  percentagePnl,
  liquidationPrice,
  quantityDecimals,
  effectiveLeverage
} = useDerivativePosition(computed(() => props.position))

const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const marketCloseStatus = reactive(new Status(StatusType.Idle))
const limitCloseStatus = reactive(new Status(StatusType.Idle))

const isMarketOrderAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgCreateDerivativeMarketOrder)
})

const isLimitOrderAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgCreateDerivativeLimitOrder)
})

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
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
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
    return notificationStore.error({ title: t('trade.no_liquidity') })
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
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
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
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
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
    .then(() => notificationStore.success({ title: t('common.success') }))
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
  <div v-if="market" v-bind="{ market }">
    <div class="flex p-2 font-mono text-xs">
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosMarketTicker)">
          {{ market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          :class="{
            'text-green-500': position.direction === TradeDirection.Long,
            'text-red-500': position.direction === TradeDirection.Short
          }"
          :data-cy="`${dataCyTag(
            PerpetualmarketCyTags.OpenPosTradeDirection
          )}-${position.direction}`"
        >
          {{ $t(`trade.${position.direction}`) }}
        </span>
      </div>

      <div v-if="market" class="flex-1 flex items-center justify-end p-2">
        <p :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosAmount)">
          {{ quantityToString }} {{ market.baseToken.symbol }}
        </p>
      </div>

      <div class="flex-1 space-y-1 p-2 text-right">
        <p :data-cy="dataCyTag(PerpetualmarketCyTags.OpenEntryPrice)">
          {{ priceToString }}
        </p>
        <p class="text-gray-500">
          {{ markPriceToString }}
        </p>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div
          class="space-y-1 text-right"
          :class="{
            'text-green-500': pnl.gte(0),
            'text-red-500': pnl.lt(0)
          }"
        >
          <p :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosUnrealizedPnl)">
            {{ pnlToString }}
            <span class="text-gray-500">{{ market.quoteToken.symbol }}</span>
          </p>
          <p>{{ percentagePnlToString }}%</p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div v-if="market" class="space-y-1">
          <p :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosTotalValue)">
            ${{ quantityInUsdToString }}
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 space-x-2 justify-end">
        <span :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosMargin)">{{
          marginToString
        }}</span>
        <button class="p-2 rounded-full bg-gray-800" @click="addMargin">
          <SharedIcon name="plus" is-xs />
        </button>
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosLiquidationPrice)"
      >
        {{ liquidationPrice.toFormat(2) }}
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosLeverage)"
      >
        {{ effectiveLeverage.toFormat(2) }}x
      </div>

      <div class="flex-1 flex items-center p-2 justify-center">
        <button
          class="p-2 rounded-full bg-blue-500 hover:bg-blue-600"
          @click="addTpSl"
        >
          <SharedIcon name="plus" is-xs />
        </button>
      </div>

      <div class="flex-[3] flex items-center p-2 overflow-hidden space-x-2">
        <AppButton
          v-bind="{
            status: marketCloseStatus,
            disabled: !isMarketOrderAuthorized,
            tooltip: isMarketOrderAuthorized ? '' : $t('common.unauthorized')
          }"
          size="sm"
          variant="danger-ghost"
          class="min-w-20"
          :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosClosePosition)"
          @click="closePositionClicked"
        >
          {{ $t('trade.market') }}
        </AppButton>

        <AppButton
          v-bind="{
            status: limitCloseStatus,
            disabled: !isLimitOrderAuthorized,
            tooltip: isLimitOrderAuthorized ? '' : $t('common.unauthorized')
          }"
          class="min-w-20"
          size="sm"
          variant="danger-ghost"
          :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosClosePosLimit)"
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
          :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosClosePositionQty)"
        />
        <AppInputBase
          v-model="priceValue"
          class="p-1 rounded min-w-0 border"
          placeholder="Price"
          :data-cy="dataCyTag(PerpetualmarketCyTags.OpenPosClosePosPrice)"
        />
      </div>
    </div>
  </div>
</template>
