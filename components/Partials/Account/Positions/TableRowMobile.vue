<script lang="ts" setup>
import { PropType } from 'vue'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { HIDDEN_BALANCE_DISPLAY } from '@/app/utils/constants'
import { BusEvents, Modal } from '@/types'

const props = defineProps({
  hideBalances: Boolean,

  position: {
    type: Object as PropType<UiPosition>,
    required: true
  }
})

const router = useRouter()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const modalStore = useModalStore()
const { success, error } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  markPrice,
  pnlToFormat,
  notionalValue,
  priceDecimals,
  percentagePnl,
  isBinaryOptions,
  quantityDecimals,
  effectiveLeverage,
  liquidationPrice
} = useDerivativePosition(computed(() => props.position))

const status = reactive(new Status(StatusType.Loading))

const currentOrders = computed(() => {
  return derivativeStore.subaccountOrders
})

const directionLocalized = computed(() => {
  return props.position.direction === TradeDirection.Long
    ? t('trade.long')
    : t('trade.short')
})

const positionCloseError = computed(() => {
  if (!market.value) {
    return
  }

  if (notEnoughLiquidityError.value) {
    return notEnoughLiquidityError.value
  }

  return undefined
})

const notEnoughLiquidityError = computed(() => {
  if (!market.value) {
    return
  }

  if (pnl.value.isNaN()) {
    return t('trade.no_liquidity')
  }

  return undefined
})

const reduceOnlyCurrentOrders = computed(() => {
  return currentOrders.value.filter(
    (order) => order.isReduceOnly && order.marketId === props.position.marketId
  )
})

const hasReduceOnlyOrders = computed(() => {
  return reduceOnlyCurrentOrders.value.length > 0
})

function handleAddMargin() {
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).emit(props.position)

  modalStore.openModal({ type: Modal.AddMarginToPosition })
}

function handleClick() {
  if (!market.value) {
    return
  }

  router.push({
    name: 'futures-futures',
    params: {
      futures: market.value.slug
    }
  })
}

function handleClosePosition() {
  if (!market.value) {
    return
  }

  if (positionCloseError.value) {
    return error({
      title: positionCloseError.value
    })
  }

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
      success({
        title: t('trade.position_closed')
      })
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
      success({
        title: t('trade.position_closed')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div v-if="market" class="border-t border-gray-600 py-4" @click="handleClick">
    <div class="flex justify-between items-center gap-2">
      <div class="col-span-1 flex justify-start items-center gap-2">
        <CommonTokenIcon v-if="market.baseToken" :token="market.baseToken" />

        <span class="text-white font-bold tracking-wide text-sm uppercase">
          {{ position.ticker }}
        </span>
      </div>

      <span
        class="text-sm mr-auto"
        data-cy="open-position-trade-direction-table-data"
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ directionLocalized }}
      </span>

      <button
        class="bg-red-500 bg-opacity-20 rounded-lg px-3 h-8 flex items-center justify-center"
        @click.stop="handleClosePosition"
      >
        <span class="text-xs text-red-500">
          {{ $t('account.positions.closePosition') }}
        </span>
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4 pt-4">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.quantity') }}
        </span>

        <span v-if="hideBalances" class="font-mono text-sm">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <AppNumber
          v-else
          sm
          flex
          :decimals="quantityDecimals"
          :number="quantity"
          data-cy="open-position-quantity-table-data"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.unrealizedPnl') }}
        </span>

        <div
          v-if="!pnl.isNaN()"
          class="flex items-center"
          :class="{
            'text-green-500': pnl.gte(0),
            'text-red-500': pnl.lt(0)
          }"
        >
          <span v-if="hideBalances" class="font-mono text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>
          <span v-if="!hideBalances" class="font-mono text-sm mr-1">≈</span>
          <span
            v-if="!hideBalances"
            class="font-mono text-sm"
            data-cy="postion-entry-pnl"
          >
            {{ pnlToFormat }}
          </span>
          <span class="ml-1 font-mono text-sm">
            {{ market.quoteToken.symbol }}
          </span>
          <span v-if="hideBalances" class="ml-1 font-mono text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>
          <span v-else class="ml-1 font-mono text-sm">
            ({{ percentagePnl.toFormat(2) }}%)
          </span>
        </div>

        <div v-else data-cy="open-position-no-pnl-table-data">
          <span class="font-mono text-sm">
            {{ $t('trade.not_available_n_a') }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 text-right">
          {{ $t('account.positions.cols.margin') }}
        </span>

        <div class="flex items-center justify-end">
          <span v-if="hideBalances" class="font-mono text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <AppNumber
            v-else
            sm
            flex
            data-cy="open-position-margin-table-data"
            :decimals="priceDecimals"
            :number="margin"
          />

          <button
            v-if="!isBinaryOptions"
            role="button"
            type="button"
            class="border border-gray-500 text-gray-500 w-5 h-5 flex justify-center items-center hover:text-blue-500 hover:border-blue-500 ml-2"
            data-cy="open-position-add-margin-button"
            @click.stop.prevent="handleAddMargin"
          >
            &plus;
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.entryPrice') }}
        </span>

        <span v-if="hideBalances">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <AppNumber
          v-else
          sm
          flex
          :decimals="priceDecimals"
          :number="price"
          data-cy="open-position-price-table-data"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.markPrice') }}
        </span>

        <AppNumber
          v-if="!markPrice.isNaN() && !hideBalances"
          sm
          flex
          :decimals="priceDecimals"
          :number="markPrice"
        />

        <span v-else class="font-mono text-sm text-gray-450">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 text-right">
          {{ $t('account.positions.cols.estLiquidationPrice') }}
        </span>

        <span v-if="isBinaryOptions" class="font-mono text-sm text-right">
          &mdash;
        </span>

        <span v-else-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <AppNumber
          v-else
          sm
          flex
          class="justify-end"
          :decimals="priceDecimals"
          :number="liquidationPrice"
          data-cy="open-position-liquidation-price-table-data"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.total') }}
        </span>

        <div v-if="hideBalances" class="flex items-center gap-1">
          <span class="font-mono text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <span class="text-sm text-gray-450 uppercase">
            {{ market.quoteToken.symbol }}
          </span>
        </div>

        <AppNumber
          v-else
          sm
          flex
          :decimals="priceDecimals"
          :number="notionalValue"
          data-cy="open-position-total-table-data"
        >
          <template #addon>
            <span class="text-sm text-gray-450 uppercase">
              {{ market.quoteToken.symbol }}
            </span>
          </template>
        </AppNumber>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500">
          {{ $t('account.positions.cols.leverage') }}
        </span>

        <span v-if="isBinaryOptions" class="text-white text-sm font-mono">
          &mdash;
        </span>

        <span v-else-if="hideBalances" class="text-white text-sm font-mono">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="effectiveLeverage.gte(0)"
          class="flex items-center justify-start text-white text-sm font-mono"
          data-cy="open-position-leverage-table-data"
        >
          {{ effectiveLeverage.toFormat(2) }}
          <span class="text-gray-300 text-sm font-mono">&times;</span>
        </span>

        <span
          v-else
          class="text-gray-500 text-sm font-mono"
          data-cy="open-position-no-leverage-table-data"
        >
          {{ $t('trade.not_available_n_a') }}
        </span>
      </div>
    </div>
  </div>
</template>
