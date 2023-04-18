<script lang="ts" setup>
import { PropType } from 'vue'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { HIDDEN_BALANCE_DISPLAY } from '@/app/utils/constants'
import { BusEvents, Modal } from '@/types'

const router = useRouter()
const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()

const props = defineProps({
  hideBalances: Boolean,

  position: {
    type: Object as PropType<UiPosition>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'share:position', state: UiPosition): void
}>()

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  markPrice,
  pnlToFormat,
  priceDecimals,
  percentagePnl,
  notionalValue,
  quantityDecimals,
  isBinaryOptions,
  liquidationPrice,
  effectiveLeverage,
  markPriceToFormat
} = useDerivativePosition(computed(() => props.position))

const status = reactive(new Status(StatusType.Idle))

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
  return derivativeStore.subaccountOrders.filter(
    (order) => order.isReduceOnly && order.marketId === props.position.marketId
  )
})

const hasReduceOnlyOrders = computed(() => {
  return reduceOnlyCurrentOrders.value.length > 0
})

const directionLocalized = computed(() => {
  return props.position.direction === TradeDirection.Long
    ? t('trade.long')
    : t('trade.short')
})

function handleAddMargin() {
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).emit(props.position)

  modalStore.openModal({ type: Modal.AddMarginToPosition })
}

function handleVisitMarket() {
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

function sharePosition() {
  emit('share:position', props.position)
}
</script>

<template>
  <tr
    v-if="market"
    class="border-b border-gray-600 last-of-type:border-b-transparent hover:bg-gray-700 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all cursor-pointer"
    :data-cy="'open-position-table-row-' + position.ticker"
  >
    <td class="pl-4">
      <div
        class="col-span-1 flex justify-start items-center gap-2"
        @click="handleVisitMarket"
      >
        <CommonTokenIcon v-if="market.baseToken" :token="market.baseToken" />
        <span
          class="text-white font-bold tracking-wide text-xs lg:text-sm uppercase"
        >
          {{ position.ticker }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1">
        <span
          class="text-xs lg:text-sm"
          data-cy="open-position-trade-direction-table-data"
          :class="{
            'text-green-500': position.direction === TradeDirection.Long,
            'text-red-500': position.direction === TradeDirection.Short
          }"
        >
          {{ directionLocalized }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <AppNumber
          v-else
          sm
          :decimals="quantityDecimals"
          :number="quantity"
          data-cy="open-position-quantity-table-data"
        />
      </div>
    </td>

    <td>
      <div class="col-span-1 flex flex-col text-right">
        <span v-if="hideBalances">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <AppNumber
          v-else
          sm
          :decimals="priceDecimals"
          :number="price"
          data-cy="open-position-price-table-data"
        />
        <span
          v-if="!markPrice.isNaN() && !hideBalances"
          class="font-mono text-xs lg:text-sm text-gray-450"
        >
          {{ markPriceToFormat }}
        </span>
        <span v-else class="font-mono text-xs lg:text-sm text-gray-450">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span v-if="isBinaryOptions" class="font-mono text-xs lg:text-sm">
          &mdash;
        </span>
        <span v-else-if="hideBalances" class="font-mono text-xs lg:text-sm">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <AppNumber
          v-else
          sm
          :decimals="priceDecimals"
          :number="liquidationPrice"
          data-cy="open-position-liquidation-price-table-data"
        />
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <div v-if="!pnl.isNaN()" class="flex items-center justify-end gap-2">
          <div
            class="flex flex-col items-end"
            :class="{
              'text-green-500': pnl.gte(0),
              'text-red-500': pnl.lt(0)
            }"
          >
            <div class="flex items-center">
              <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
                {{ HIDDEN_BALANCE_DISPLAY }}
              </span>
              <span
                v-if="!hideBalances"
                class="font-mono text-xs lg:text-sm mr-1"
              >
                ≈
              </span>
              <span v-if="!hideBalances" class="font-mono text-xs lg:text-sm">
                {{ pnl.gte(0) ? '+' : '' }}
              </span>
              <span
                v-if="!hideBalances"
                class="font-mono text-xs lg:text-sm"
                data-cy="postion-entry-pnl"
              >
                {{ pnlToFormat }}
              </span>
              <span class="ml-1 font-mono text-xs lg:text-sm">
                {{ market.quoteToken.symbol }}
              </span>
            </div>
            <span
              v-if="hideBalances"
              class="flex mt-1 font-mono text-xs lg:text-sm"
            >
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>
            <span v-else class="flex mt-1 font-mono text-xs lg:text-sm">
              {{
                (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2)
              }}%
            </span>
          </div>

          <BaseIcon
            name="share"
            class="text-gray-500 hover:text-gray-400 w-4 h-4 min-w-4"
            @click="sharePosition"
          />
        </div>

        <div v-else data-cy="open-position-no-pnl-table-data">
          <span class="font-mono text-xs lg:text-sm">
            {{ $t('trade.not_available_n_a') }}
          </span>
        </div>
      </div>
    </td>

    <td>
      <div class="col-span-1 flex gap-1 justify-end">
        <div v-if="hideBalances" class="flex items-center gap-1">
          <span class="font-mono text-xs lg:text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <span class="text-xs lg:text-sm text-gray-450 uppercase">
            {{ market.quoteToken.symbol }}
          </span>
        </div>

        <AppNumber
          v-else
          sm
          :decimals="priceDecimals"
          :number="notionalValue"
          data-cy="open-position-total-table-data"
        >
          <template #addon>
            <span class="text-xs lg:text-sm text-gray-450 uppercase">
              {{ market.quoteToken.symbol }}
            </span>
          </template>
        </AppNumber>
      </div>
    </td>

    <td>
      <div class="col-span-1 flex text-right justify-end gap-1 items-center">
        <div class="flex items-center justify-end">
          <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <AppNumber
            v-else
            sm
            data-cy="open-position-margin-table-data"
            :decimals="priceDecimals"
            :number="margin"
          />

          <div
            v-if="!isBinaryOptions"
            class="cursor-pointer flex items-center justify-center rounded-full bg-opacity-10 hover:bg-opacity-30 hover:text-blue-500 text-gray-500 min-w-4 w-4 h-4 border border-gray-500 hover:border-blue-500 ml-1"
            @click.stop="handleAddMargin"
          >
            <BaseIcon name="plus" xs />
          </div>
        </div>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span
          v-if="isBinaryOptions"
          class="text-white text-xs lg:text-sm font-mono"
        >
          &mdash;
        </span>
        <span
          v-else-if="hideBalances"
          class="text-white text-xs lg:text-sm font-mono"
        >
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <span
          v-else-if="effectiveLeverage.gte(0)"
          class="flex items-center justify-end text-white text-xs lg:text-sm font-mono"
          data-cy="open-position-leverage-table-data"
        >
          {{ effectiveLeverage.toFormat(2) }}
          <span class="text-gray-300 text-xs lg:text-sm font-mono">
            &times;
          </span>
        </span>
        <span
          v-else
          class="text-gray-500 text-xs lg:text-sm font-mono"
          data-cy="open-position-no-leverage-table-data"
        >
          {{ $t('trade.not_available_n_a') }}
        </span>
      </div>
    </td>

    <td class="pr-4">
      <div class="col-span-1 flex items-center justify-end gap-4">
        <button
          data-cy="open-position-cancel-link"
          :status="status"
          class="rounded w-6 h-6"
          @click.stop="handleClosePosition"
        >
          <div
            class="flex items-center justify-center rounded-full bg-opacity-10 w-6 h-6 hover:bg-opacity-10 bg-red-500 hover:bg-red-600 text-red-500 hover:text-red-600"
          >
            <BaseIcon name="close" class="h-4 w-4" />
          </div>
        </button>
      </div>
    </td>
  </tr>
</template>
