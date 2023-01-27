<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'

const FilterList = {
  OpenPositions: 'OpenPositions',
  OpenOrders: 'OpenOrders',
  Triggers: 'Triggers',
  OrderHistory: 'OrderHistory',
  TradeHistory: 'TradeHistory'
}

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()
const { t } = useLang()
const { success } = useNotifications()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const currentMarketOnly = ref(false)
const status = reactive(new Status(StatusType.Loading))
const actionStatus = reactive(new Status(StatusType.Idle))
const activeType = ref(FilterList.OpenOrders)

const filteredOrders = computed(() => {
  return derivativeStore.subaccountOrders.filter((order) => {
    if (props.market.subType !== MarketType.BinaryOptions) {
      return derivativeStore.markets.some(
        (market) => market.marketId === order.marketId
      )
    }

    return derivativeStore.binaryOptionsMarkets.some(
      (market) => market.marketId === order.marketId
    )
  })
})

const filteredPositions = computed(() => {
  const result = positionStore.subaccountPositions.filter((position) => {
    return !!derivativeStore.markets.find(
      (m) => m.marketId === position.marketId
    )
  })

  return result.filter((position) => {
    if (props.market.subType !== MarketType.BinaryOptions) {
      return position
    }

    return derivativeStore.binaryOptionsMarkets.some(
      (market) => market.marketId === position.marketId
    )
  })
})

const orders = computed(() => {
  if (activeType.value === FilterList.OpenOrders) {
    return derivativeStore.subaccountOrders
  }

  return derivativeStore.subaccountConditionalOrders
})

onMounted(() => {
  if (positionStore.subaccountPositions.length > 0) {
    activeType.value = FilterList.OpenPositions
  } else if (derivativeStore.subaccountOrders.length > 0) {
    activeType.value = FilterList.OpenOrders
  }

  init()
})

function reset() {
  Promise.all([
    positionStore.cancelSubaccountPositionsStream(),
    derivativeStore.cancelSubaccountOrdersStream(),
    derivativeStore.cancelSubaccountOrderHistoryStream(),
    derivativeStore.cancelSubaccountTradesStream()
  ])
}

function init() {
  status.setLoading()

  const fetchOptions = {
    filters: {
      marketId:
        currentMarketOnly.value && props.market
          ? props.market.marketId
          : undefined
    },
    pagination: {
      endTime: 0
    }
  }

  Promise.all([
    derivativeStore.fetchSubaccountOrders(fetchOptions),
    derivativeStore.fetchSubaccountOrderHistory(fetchOptions),
    derivativeStore.fetchSubaccountConditionalOrders(fetchOptions),
    derivativeStore.fetchSubaccountTrades(fetchOptions),
    positionStore.fetchSubaccountPositions(fetchOptions),
    positionStore.streamSubaccountPositions(fetchOptions.filters.marketId),
    derivativeStore.streamSubaccountOrders(fetchOptions.filters.marketId),
    derivativeStore.streamSubaccountOrderHistory(fetchOptions.filters.marketId),
    derivativeStore.streamSubaccountTrades(fetchOptions.filters.marketId)
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleCancelAllClick() {
  actionStatus.setLoading()

  const action =
    orders.value.length === 1
      ? derivativeStore.cancelOrder(orders.value[0])
      : derivativeStore.batchCancelOrder(orders.value)

  action
    .then(() => {
      success({ title: t('trade.orders_cancelled') })
    })
    .catch($onError)
    .finally(() => {
      actionStatus.setIdle()
    })
}

function closeAllPositions(): Promise<void> {
  return positionStore.closeAllPosition(filteredPositions.value)
}

function closePosition(): Promise<void> {
  const [position] = filteredPositions.value
  const market = derivativeStore.markets.find(
    (m) => m.marketId === position.marketId
  )

  if (!market) {
    return Promise.reject(
      new GeneralException(
        Error(
          t('trade.position_market_not_found', {
            marketId: position.marketId
          })
        )
      )
    )
  }

  return positionStore.closePosition({
    position,
    market
  })
}

function handleCloseAllPositionsClick() {
  actionStatus.setLoading()

  const action =
    filteredPositions.value.length === 1 ? closePosition : closeAllPositions

  action()
    .then(() => {
      success({ title: t('trade.positions_closed') })
    })
    .catch($onError)
    .finally(() => {
      actionStatus.setIdle()
    })
}

watch(
  currentMarketOnly,
  () => {
    reset()
    init()
  },
  { immediate: true }
)
</script>

<template>
  <CommonCardTableWrap>
    <template #actions>
      <div class="col-span-12 lg:col-span-7 xl:col-span-8 m-4 lg:mx-0">
        <div
          class="flex items-center justify-between lg:justify-start gap-2 ml-2"
        >
          <template
            v-for="(filterType, index) in Object.values(FilterList)"
            :key="`derivative-orders-type-${filterType}`"
          >
            <AppSelectButton v-model="activeType" :value="filterType">
              <template #default="{ active }">
                <span
                  class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
                  :class="[active ? 'text-blue-500' : 'text-gray-500']"
                >
                  <span v-if="filterType === FilterList.OpenPositions">
                    {{ $t('activity.openPositions') }}
                    {{ `(${filteredPositions.length})` }}
                  </span>

                  <span v-if="filterType === FilterList.OpenOrders">
                    {{ $t('activity.openOrders') }}
                    {{ `(${filteredOrders.length})` }}
                  </span>

                  <span v-if="filterType === FilterList.Triggers">
                    {{ $t('activity.triggers') }}
                    {{
                      `(${derivativeStore.subaccountConditionalOrders.length})`
                    }}
                  </span>

                  <span v-if="filterType === FilterList.TradeHistory">
                    {{ $t('activity.tradeHistory') }}
                  </span>

                  <span v-if="filterType === FilterList.OrderHistory">
                    {{ $t('activity.orderHistory') }}
                  </span>
                </span>
              </template>
            </AppSelectButton>

            <CommonSeparator
              v-if="index !== Object.values(FilterList).length - 1"
            />
          </template>
        </div>
      </div>

      <div
        class="col-span-12 lg:col-span-5 xl:col-span-4 mx-4 mb-4 flex items-center justify-between lg:justify-end lg:ml-0 lg:mr-2 lg:mt-4"
      >
        <AppCheckbox
          v-if="market"
          v-model="currentMarketOnly"
          data-cy="trade-page-filter-by-ticker-checkbox"
          class="lg:mr-4"
        >
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </AppCheckbox>

        <AppButton
          v-if="orders.length > 0"
          class="bg-red-500 bg-opacity-10 text-red-500 hover:text-white"
          xs
          :status="actionStatus"
          data-cy="trade-page-cancel-all-button"
          @click="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </AppButton>

        <AppButton
          v-if="
            activeType === FilterList.OpenPositions &&
            filteredPositions.length > 0
          "
          xs
          :status="actionStatus"
          data-cy="trade-page-cancel-all-button"
          class="bg-red-500 bg-opacity-10 text-red-500 hover:text-white"
          @click="handleCloseAllPositionsClick"
        >
          {{ $t('trade.closeAllPositions') }}
        </AppButton>
      </div>
    </template>

    <AppHocLoading :status="status">
      <CommonCard class="h-full p-2 relative" no-padding>
        <PartialsCommonSubaccountTradeHistory
          v-if="activeType === FilterList.TradeHistory"
          :market="market"
        />

        <PartialsCommonSubaccountOrder
          v-else-if="activeType === FilterList.OpenOrders"
          :market="market"
        />

        <PartialsCommonSubaccountTrigger
          v-else-if="activeType === FilterList.Triggers"
        />

        <PartialsCommonSubaccountOrderHistory
          v-else-if="activeType === FilterList.OrderHistory"
          :market="market"
        />

        <PartialsCommonSubaccountPosition
          v-else-if="activeType === FilterList.OpenPositions"
          :market="market"
        />
      </CommonCard>
    </AppHocLoading>
  </CommonCardTableWrap>
</template>
