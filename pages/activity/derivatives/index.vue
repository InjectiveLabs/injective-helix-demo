<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityField, ActivityPage } from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const actionStatus = reactive(new Status(StatusType.Idle))

const { value: denom } = useStringField({
  name: ActivityField.Denom,
  rule: '',
  initialValue: ''
})
const { value: side } = useStringField({ name: ActivityField.Side, rule: '' })

const markets = computed(() => {
  return derivativeStore.markets
    .filter((m) => [m.baseToken.denom, m.quoteDenom].includes(denom.value))
    .map(({ marketId }) => marketId)
})

const filteredOrders = computed(() =>
  derivativeStore.subaccountOrders.filter((order) => {
    const orderMatchesDenom =
      markets.value.length === 0 || markets.value.includes(order.marketId)
    const orderMatchesSide = !side.value || side.value === order.orderSide

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
    <ClientOnly>
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

      <Teleport :to="`#${ActivityPage.DerivativeOpenOrders}`">
        <span class="ml-1">({{ filteredOrders.length }})</span>
      </Teleport>
    </ClientOnly>

    <div class="w-full h-full">
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
  </div>
</template>
