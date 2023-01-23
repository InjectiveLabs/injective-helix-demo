<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'

const { $onError } = useNuxtApp()
const spotStore = useSpotStore()
const { t } = useLang()
const { success } = useNotifications()

const FilterList = {
  OpenOrders: 'openOrders',
  OrderHistory: 'orderHistory',
  TradeHistory: 'TradeHistory'
}

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const currentMarketOnly = ref(false)
const status = reactive(new Status(StatusType.Loading))
const actionStatus = reactive(new Status(StatusType.Idle))

const activeType = ref(FilterList.OpenOrders)

function fetchAll() {
  status.setLoading()

  const fetchOptions = {
    filters: {
      marketId: currentMarketOnly ? props.market.marketId : undefined
    },
    pagination: {
      endTime: 0
    }
  }

  Promise.all([
    spotStore.fetchSubaccountOrders(fetchOptions),
    spotStore.fetchSubaccountOrderHistory(fetchOptions),
    spotStore.fetchSubaccountTrades(fetchOptions)
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleCancelAllClick() {
  actionStatus.setLoading()

  const action =
    spotStore.subaccountOrders.length === 1
      ? spotStore.cancelOrder(spotStore.subaccountOrders[0])
      : spotStore.batchCancelOrder(spotStore.subaccountOrders)

  action
    .then(() => {
      success({ title: t('trade.orders_cancelled') })
    })
    .catch($onError)
    .finally(() => actionStatus.setIdle())
}

watch(currentMarketOnly, fetchAll, { immediate: true })
</script>

<template>
  <CommonCardTableWrap>
    <template #actions>
      <div class="col-span-12 sm:col-span-6 m-4 lg:mx-0">
        <div
          class="flex items-center justify-between sm:justify-start gap-2 ml-2"
        >
          <template
            v-for="(filterType, index) in Object.values(FilterList)"
            :key="`spot-orders-type-${filterType}`"
          >
            <AppSelectButton v-model="activeType" :value="filterType">
              <template #default="{ active }">
                <span
                  class="uppercase text-xs font-semibold"
                  :class="[active ? 'text-blue-500' : 'text-gray-500']"
                >
                  <span v-if="filterType === FilterList.OpenOrders">
                    {{ $t('trade.open_orders') }}
                    {{ `(${spotStore.subaccountOrders.length})` }}
                  </span>

                  <span v-if="filterType === FilterList.OrderHistory">
                    {{ $t('activity.orderHistory') }}
                  </span>

                  <span v-if="filterType === FilterList.TradeHistory">
                    {{ $t('trade.trade_history') }}
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
        class="col-span-12 sm:col-span-6 mb-4 mx-4 sm:mt-4 flex items-center justify-between sm:justify-end"
      >
        <AppCheckbox
          v-model="currentMarketOnly"
          data-cy="trade-page-filter-by-ticker-checkbox"
          class="lg:mr-4"
        >
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </AppCheckbox>

        <AppButton
          v-if="
            activeType === FilterList.OpenOrders &&
            spotStore.subaccountOrders.length > 0
          "
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          xs
          :status="actionStatus"
          data-cy="trade-page-cancel-all-button"
          @click="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </AppButton>
      </div>
    </template>

    <AppHocLoading :status="status">
      <CommonCard class="h-full">
        <PartialsTradingTableTradeHistory
          v-if="activeType === FilterList.TradeHistory"
          :market="market"
        />

        <PartialsTradingTableOrder
          v-else-if="activeType === FilterList.OpenOrders"
          :market="market"
          is-spot
        />

        <PartialsTradingTableOrderHistory
          v-else-if="activeType === FilterList.OrderHistory"
          :market="market"
        />
      </CommonCard>
    </AppHocLoading>
  </CommonCardTableWrap>
</template>
