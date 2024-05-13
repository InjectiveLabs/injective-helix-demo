<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarket } from '@/types'

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
  filterByCurrentMarket: Boolean,

  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    required: true
  }
})

const emit = defineEmits<{
  'update:filterByCurrentMarket': [state: boolean]
}>()

const activeType = ref(FilterList.OpenOrders)
const actionStatus = reactive(new Status(StatusType.Idle))

const checked = computed({
  get: (): boolean => props.filterByCurrentMarket,
  set: (value: boolean) => {
    emit('update:filterByCurrentMarket', value)
  }
})

function onCancelAll() {
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
</script>

<template>
  <CommonCardTableWrap>
    <template #actions>
      <div class="col-span-12 lg:col-span-7 xl:col-span-8 m-4 lg:mx-0">
        <div
          class="flex items-center justify-between sm:justify-start gap-2 ml-2"
        >
          <template
            v-for="(filterType, index) in Object.values(FilterList)"
            :key="`spot-orders-type-${filterType}`"
          >
            <AppSelectButton
              v-model="activeType"
              :value="filterType"
              class="text-center"
            >
              <template #default="{ isActive }">
                <span
                  class="uppercase text-xs font-semibold"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-500']"
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
        class="col-span-12 lg:col-span-5 xl:col-span-4 mx-4 mb-4 flex items-center justify-between lg:justify-end lg:ml-0 lg:mr-2 lg:mt-4"
      >
        <AppCheckbox
          v-model="checked"
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
          is-xs
          :is-loading="actionStatus.isLoading()"
          data-cy="trade-page-cancel-all-button"
          @click="onCancelAll"
        >
          {{ $t('trade.cancelAllOrders') }}
        </AppButton>
      </div>
    </template>

    <AppHocLoading class="h-full" :status="status">
      <CommonCard class="h-full flex-auto">
        <PartialsCommonSubaccountTradeHistory
          v-if="activeType === FilterList.TradeHistory"
          :market="market"
        />

        <PartialsCommonSubaccountOrder
          v-else-if="activeType === FilterList.OpenOrders"
          :market="market"
          is-spot
        />

        <PartialsCommonSubaccountOrderHistory
          v-else-if="activeType === FilterList.OrderHistory"
          :market="market"
        />
      </CommonCard>
    </AppHocLoading>
  </CommonCardTableWrap>
</template>
