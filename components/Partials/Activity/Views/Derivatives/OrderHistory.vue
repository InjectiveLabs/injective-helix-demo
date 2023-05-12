<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const derivativeStore = useDerivativeStore()

const orders = computed(() => derivativeStore.subaccountOrderHistory)
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full">
      <!-- mobile table -->
      <CommonTableBody
        :show-empty="orders.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountOrderHistoryMobile
          v-for="(order, index) in orders"
          :key="`mobile-derivative-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :is-spot="false"
          :order="order"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyOrders')"
            class="grow pb-4 bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper break-md class="hidden sm:block">
        <table v-if="orders.length > 0" class="table">
          <PartialsCommonSubaccountOrderHistoryHeader />
          <tbody>
            <PartialsCommonSubaccountOrderHistoryRow
              v-for="(order, index) in orders"
              :key="`order-${index}-${order.orderHash}`"
              :order="order"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('trade.emptyOrders')"
          data-cy="universal-table-nothing-found"
          class="grow pb-4"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>
