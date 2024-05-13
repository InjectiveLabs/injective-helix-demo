<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === SharedMarketType.Spot

const store = computed(() => (isSpot ? spotStore : derivativeStore))

const sortedOrders = computed(() =>
  store.value.subaccountOrders.sort((o1, o2) => o2.updatedAt - o1.updatedAt)
)
</script>

<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :is-empty="sortedOrders.length === 0"
      class="sm:hidden max-h-lg"
    >
      <PartialsCommonSubaccountOrderMobile
        v-for="(order, index) in sortedOrders"
        :key="`mobile-order-${index}-${order.orderHash}`"
        class="col-span-1"
        :order="order"
        :is-spot="isSpot"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyOrders')"
          class="min-h-orders bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table v-if="sortedOrders.length > 0" class="table">
        <PartialsCommonSubaccountOrderHeader v-bind="{ isSpot }" />
        <tbody>
          <PartialsCommonSubaccountOrderRow
            v-for="(order, index) in sortedOrders"
            :key="`orders-${index}-${order.orderHash}`"
            v-bind="{ isSpot, order }"
            :order="order"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyOrders')" />
    </CommonTableWrapper>
  </div>
</template>
