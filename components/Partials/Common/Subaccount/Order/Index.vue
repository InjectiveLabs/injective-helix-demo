<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot
const store = computed(() => (isSpot ? spotStore : derivativeStore))
</script>

<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :show-empty="store.subaccountOrders.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <PartialsCommonSubaccountOrderMobile
        v-for="(order, index) in store.subaccountOrders"
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
      <table v-if="store.subaccountOrders.length > 0" class="table">
        <PartialsCommonSubaccountOrderHeader />
        <tbody>
          <PartialsCommonSubaccountOrderRow
            v-for="(order, index) in store.subaccountOrders"
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
