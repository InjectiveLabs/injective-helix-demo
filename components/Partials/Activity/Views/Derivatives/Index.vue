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

const orders = computed(() => {
  return derivativeStore.subaccountOrders
})
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full-flex">
      <!-- mobile table -->
      <CommonTableBody
        :show-empty="orders.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsTradingTableOrderMobile
          v-for="(order, index) in orders"
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
        <table v-if="orders.length > 0" class="table">
          <PartialsTradingTableOrderHeader />
          <tbody>
            <PartialsTradingTableOrderRow
              v-for="(order, index) in orders"
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
</template>
