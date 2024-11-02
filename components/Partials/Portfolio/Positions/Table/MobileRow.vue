<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { Position, PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { ClosePositionLimitForm, ClosePositionLimitFormField } from '@/types'

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
    .then(() => {
      notificationStore.success({ title: t('trade.position_closed') })
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
    .then(() => {
      notificationStore.success({ title: t('common.success') })
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

function sharePosition() {
  emit('position:share', props.position)
}
</script>

<template>
  <div v-if="market">
    <div class="p-2 text-xs divide-y">
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex items-center space-x-2 px-2 py-4 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

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
          <p class="flex gap-1">
            <AppAmount
              v-bind="{
                amount: quantity.toFixed(),
                decimalPlaces: quantityDecimals
              }"
            />
            {{ market.baseToken.overrideSymbol || market.baseToken.symbol }}
          </p>
        </div>
      </div>

      <div class="flex justify-between">
        <div class="space-y-1 p-2 flex items-center">
          <p>{{ $t('trade.entryMark') }}</p>
        </div>

        <div class="space-y-1 p-2 flex flex-col items-end">
          <p>
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
      </div>

      <div class="flex justify-between">
        <div class="space-y-1 p-2 flex items-center">
          <p>{{ $t('portfolio.balances.unrealizedPnl') }}</p>
        </div>

        <div class="flex items-center p-2 space-x-2">
          <div
            class="space-y-1 text-right"
            :class="{
              'text-green-500': pnl.gte(0),
              'text-red-500': pnl.lt(0)
            }"
          >
            <p class="flex gap-1">
              <AppAmount
                v-bind="{
                  amount: pnl.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              />
              <span class="text-coolGray-500">
                {{ market?.quoteToken.symbol }}
              </span>
            </p>
            <p class="flex">
              <AppAmount
                v-bind="{
                  amount: percentagePnl.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              >
                %
              </AppAmount>
            </p>
          </div>

          <UIcon
            :name="NuxtUiIcons.Share"
            class="text-coolGray-500 hover:text-coolGray-400 w-4 h-4 min-w-4"
            @click="sharePosition"
          />
        </div>
      </div>

      <div class="flex justify-between items-center px-2 py-4">
        <p>{{ $t('portfolio.balances.totalValueUsd') }}</p>

        <div v-if="market" class="space-y-1">
          <p class="flex">
            <span>$</span>
            <AppUsdAmount
              v-bind="{
                amount: quantityInUsd.toFixed()
              }"
            />
          </p>
        </div>
      </div>

      <div class="flex justify-between items-center px-2 py-4">
        <p>{{ $t('trade.margin') }}</p>

        <div class="space-x-2">
          <AppAmount
            v-bind="{
              amount: margin.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <button class="p-2 rounded-full bg-coolGray-800" @click="addMargin">
            <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center px-2 py-4 justify-between">
        <p>{{ $t('trade.liquidation_price') }}</p>
        <p>
          <AppAmount
            v-bind="{
              decimalPlaces: priceDecimals,
              amount: liquidationPrice.toFixed()
            }"
          />
        </p>
      </div>

      <div class="justify-between flex items-center px-2 py-4">
        <p>{{ $t('trade.leverage') }}</p>
        <span class="flex">
          <AppAmount
            v-bind="{
              amount: effectiveLeverage.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />x
        </span>
      </div>

      <div class="flex-1 flex items-center px-2 py-4">
        <AppButton variant="primary-outline" class="w-full" @click="addTpSl">
          {{ $t('trade.addTpSl') }}
        </AppButton>
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
  </div>
</template>
