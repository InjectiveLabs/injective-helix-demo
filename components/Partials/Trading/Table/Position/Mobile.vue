<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { BusEvents, Modal } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const modalStore = useModalStore()
const { t } = useLang()
const { error, success } = useNotifications()
const { $onError } = useNuxtApp()

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  pnlToFormat,
  notionalValue,
  effectiveLeverage,
  markPriceToFormat,
  liquidationPrice
} = useDerivativePosition(computed(() => props.position))

const props = defineProps({
  hideBalance: Boolean,

  position: {
    required: true,
    type: Object as PropType<UiPosition>
  }
})

const status = reactive(new Status())

const reduceOnlyCurrentOrders = computed(() =>
  derivativeStore.subaccountOrders.filter(
    (order) => order.isReduceOnly && order.marketId === props.position.marketId
  )
)

const hasReduceOnlyOrders = computed(
  () => reduceOnlyCurrentOrders.value.length > 0
)

function onAddMarginButtonClick() {
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).emit(props.position)

  modalStore.openModal({ type: Modal.AddMarginToPosition })
}

function onClosePositionClick() {
  if (!market.value) {
    return
  }

  if (pnl.value.isNaN()) {
    return error({ title: t('trade.no_liquidity') })
  }

  handleClosePosition()
}

function handleClosePosition() {
  if (hasReduceOnlyOrders.value) {
    return closePositionAndReduceOnlyOrders()
  }

  return closePosition()
}

function closePosition() {
  if (!market.value) {
    return
  }

  status.setLoading()

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
      status.setIdle()
    })
}

function closePositionAndReduceOnlyOrders() {
  if (!market.value) {
    return
  }
  status.setLoading()

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
      status.setIdle()
    })
}
</script>

<template>
  <CommonTableRow v-if="market" dense>
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <div class="flex items-center gap-1">
        <span
          :class="{
            'text-green-500': position.direction === TradeDirection.Long,
            'text-red-500': position.direction === TradeDirection.Short
          }"
        >
          {{
            position.direction === TradeDirection.Long
              ? $t('trade.long')
              : $t('trade.short')
          }}
        </span>
        <div v-if="market.baseToken" class="w-4 h-4">
          <CommonTokenIcon
            v-if="market.baseToken"
            :token="market.baseToken"
            sm
          />
        </div>
        <span class="text-gray-200 font-semibold">
          {{ position.ticker }}
        </span>

        <div v-if="!hideBalance && effectiveLeverage.gte(0)" class="font-mono">
          <span>{{ effectiveLeverage.toFormat(2) }}x</span>
        </div>
      </div>

      <AppButton
        v-if="!hideBalance"
        class="cursor-pointer rounded"
        :status="status"
        @click="onClosePositionClick"
      >
        <div
          class="flex items-center justify-center rounded-full bg-opacity-10 w-5 h-5 hover:bg-opacity-10 bg-red-500 text-red-500"
        >
          <BaseIcon name="close" class="h-3 w-3" />
        </div>
      </AppButton>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.amount') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <AppNumber
        v-else
        dense
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.entryMark') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else class="flex justify-end items-center whitespace-nowrap">
        <AppNumber
          dense
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
        <span class="text-gray-500 ml-1">/ {{ markPriceToFormat }}</span>
      </div>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.estLiqPrice') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else class="flex justify-end items-center">
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <AppNumber
          v-else
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="liquidationPrice"
        />
      </div>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.unrealized_pnl') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else class="flex justify-end items-center">
        <span v-if="pnl.isNaN()">{{ $t('trade.not_available_n_a') }}</span>
        <div
          v-else
          :class="{
            'text-green-500': pnl.gte(0) && !pnl.isNaN(),
            'text-red-500': pnl.lt(0) && !pnl.isNaN()
          }"
          class="flex items-center gap-1"
        >
          <span>≈</span>
          <span>{{ pnl.gte(0) ? '+' : '' }}</span>
          <span>{{ pnlToFormat }}</span>
          <span class="text-3xs">{{ market.quoteToken.symbol }}</span>
        </div>
      </div>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.total') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <AppNumber
        v-else
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="notionalValue"
      >
        <template #addon>
          <span class="text-gray-500 text-3xs">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppNumber>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.margin') }}
    </span>
    <div class="text-right">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else class="flex items-center justify-end h-4">
        <AppNumber
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="margin"
        />
        <button
          role="button"
          type="button"
          class="border border-gray-500 text-gray-500 ml-2 px-1"
          @click.stop.prevent="onAddMarginButtonClick"
        >
          &plus;
        </button>
      </div>
    </div>
  </CommonTableRow>
</template>
