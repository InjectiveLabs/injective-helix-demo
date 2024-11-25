<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { Position, PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  PerpetualMarketCyTags,
  ClosePositionLimitForm,
  ClosePositionLimitFormField
} from '@/types'

const authZStore = useAuthZStore()
const tokenStore = useTokenStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()
const { validate } = useForm<ClosePositionLimitForm>()

const props = withDefaults(
  defineProps<{
    position: PositionV2 | Position
  }>(),
  {}
)

const emit = defineEmits<{
  'margin:add': [position: Position | PositionV2]
  'tpsl:add': [position: Position | PositionV2]
  'position:share': [state: Position | PositionV2]
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

const quantityInUsd = computed(() =>
  quantity.value
    .times(markPrice.value)
    .times(tokenStore.tokenUsdPrice(market.value?.quoteToken) || 0)
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

function sharePosition() {
  emit('position:share', props.position)
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
        <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMarketTicker)">
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
            PerpetualMarketCyTags.OpenPosTradeDirection
          )}-${position.direction}`"
        >
          {{ $t(`trade.${position.direction}`) }}
        </span>
      </div>

      <div v-if="market" class="flex-1 flex items-center justify-end p-2">
        <p
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosAmount)"
          class="flex gap-1"
        >
          <AppAmount
            v-bind="{
              amount: quantity.toFixed(),
              decimalPlaces: quantityDecimals
            }"
          />
          {{ market.baseToken.overrideSymbol || market.baseToken.symbol }}
        </p>
      </div>

      <div class="flex-1 space-y-1 p-2 flex flex-col items-end">
        <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenEntryPrice)">
          <AppAmount
            v-bind="{
              amount: price.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
        </p>
        <p class="text-coolGray-500">
          <AppAmount
            v-bind="{
              amount: markPrice.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
        </p>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end space-x-1">
        <div
          class="space-y-1 text-right"
          :class="{
            'text-green-500': pnl.gte(0),
            'text-red-500': pnl.lt(0)
          }"
        >
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosUnrealizedPnl)"
            class="flex gap-1"
          >
            <AppAmount
              v-bind="{
                amount: pnl.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />

            <span class="text-coolGray-500">{{
              market.quoteToken.symbol
            }}</span>
          </p>
          <p class="flex">
            <AppAmount
              v-bind="{
                amount: percentagePnl.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />%
          </p>
        </div>

        <UIcon
          :name="NuxtUiIcons.Share"
          class="text-coolGray-500 hover:text-coolGray-400 w-4 h-4 min-w-4"
          @click="sharePosition"
        />
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div v-if="market" class="space-y-1">
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosTotalValue)"
            class="flex"
          >
            <span>$</span>
            <AppUsdAmount
              v-bind="{
                amount: quantityInUsd.toFixed()
              }"
            />
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 space-x-2 justify-end">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMargin)">
          <AppAmount
            v-bind="{
              amount: margin.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
        </span>
        <button
          class="flex p-2 rounded-full bg-coolGray-800"
          @click="addMargin"
        >
          <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
        </button>
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLiquidationPrice)"
      >
        <AppAmount
          v-bind="{
            decimalPlaces: priceDecimals,
            amount: liquidationPrice.toFixed()
          }"
        />
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLeverage)"
      >
        <AppAmount
          v-bind="{
            amount: effectiveLeverage.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />x
      </div>

      <div class="flex-1 flex items-center p-2 justify-center">
        <button
          class="flex p-2 rounded-full bg-blue-500 hover:bg-blue-600"
          @click="addTpSl"
        >
          <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosition)"
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosLimit)"
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePositionQty)"
        />
        <AppInputBase
          v-model="priceValue"
          class="p-1 rounded min-w-0 border"
          placeholder="Price"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosPrice)"
        />
      </div>
    </div>
  </div>
</template>
