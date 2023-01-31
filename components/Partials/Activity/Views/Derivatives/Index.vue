<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  denom: {
    type: String,
    default: ''
  },

  side: {
    type: String,
    default: ''
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const actionStatus = reactive(new Status(StatusType.Idle))

const markets = computed(() => {
  return derivativeStore.markets
    .filter(
      (m) =>
        m.baseToken.denom === props.denom || m.quoteToken.denom === props.denom
    )
    .map(({ marketId }) => marketId)
})

const filteredOrders = computed(() =>
  derivativeStore.subaccountOrders.filter((order) => {
    const orderMatchesDenom =
      markets.value.length === 0 || markets.value.includes(order.marketId)
    const orderMatchesSide = !props.side || props.side === order.orderSide

    return orderMatchesDenom && orderMatchesSide
  })
)

function handleCancelOrders() {
  actionStatus.setLoading()

  const action =
    filteredOrders.value.length === 1
      ? derivativeStore.cancelOrder(filteredOrders.value[0])
      : derivativeStore.batchCancelOrder(filteredOrders.value)

  action
    .then(() => {
      success({
        title: t('trade.orders_cancelled')
      })
    })
    .catch($onError)
    .finally(() => {
      actionStatus.setIdle()
    })
}
</script>

<template>
  <div>
    <Teleport to="#activity-toolbar-action">
      <AppButton
        v-if="filteredOrders.length > 0"
        class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
        :status="actionStatus"
        data-cy="activity-cancel-all-button"
        @click="handleCancelOrders"
      >
        <span class="whitespace-nowrap">
          {{ $t('trade.cancelAllOrders') }}
        </span>
      </AppButton>
    </Teleport>

    <AppHocLoading
      :status="status"
      :loader-class="status.isLoading() ? 'relative' : ''"
    >
      <div class="w-full h-full-flex">
        <!-- mobile table -->
        <CommonTableBody
          :show-empty="filteredOrders.length === 0"
          class="sm:hidden mt-3 max-h-lg overflow-y-auto"
        >
          <PartialsCommonSubaccountOrderMobile
            v-for="(order, index) in filteredOrders"
            :key="`mobile-derivative-orders-${index}-${order.orderHash}`"
            class="col-span-1"
            :is-spot="false"
            :order="order"
          />

          <template #empty>
            <CommonEmptyList
              :message="$t('trade.emptyOrders')"
              class="pb-4 grow bg-gray-900"
            />
          </template>
        </CommonTableBody>

        <CommonTableWrapper break-md class="hidden sm:block">
          <table v-if="filteredOrders.length > 0" class="table">
            <PartialsCommonSubaccountOrderHeader />
            <tbody>
              <PartialsCommonSubaccountOrderRow
                v-for="(order, index) in filteredOrders"
                :key="`orders-${index}-${order.orderHash}`"
                :order="order"
              />
            </tbody>
          </table>

          <CommonEmptyList
            v-else
            :message="$t('trade.emptyOrders')"
            data-cy="universal-table-nothing-found"
            class="pb-4 grow"
          />
        </CommonTableWrapper>
      </div>
    </AppHocLoading>
  </div>
</template>
