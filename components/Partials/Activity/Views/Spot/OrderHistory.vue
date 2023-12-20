<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

const spotStore = useSpotStore()

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const orderHistory = computed(() => spotStore.subaccountOrderHistory)
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full">
      <!-- mobile table -->
      <CommonTableBody
        :is-empty="orderHistory.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountOrderHistoryMobile
          v-for="(order, index) in orderHistory"
          :key="`mobile-spot-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :is-spot="true"
          :order="order"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyOrders')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper is-break-md class="hidden sm:block">
        <table v-if="orderHistory.length > 0" class="table">
          <PartialsCommonSubaccountOrderHistoryHeader />
          <tbody>
            <PartialsCommonSubaccountOrderHistoryRow
              v-for="(order, index) in orderHistory"
              :key="`order-${index}`"
              is-spot
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
