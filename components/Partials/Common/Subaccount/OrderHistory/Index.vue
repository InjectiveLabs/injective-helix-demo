<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const orderHistories = computed(() =>
  isSpot
    ? spotStore.subaccountOrderHistory
    : derivativeStore.subaccountOrderHistory
)

const sortedOrderHistories = computed(() =>
  orderHistories.value.sort((o1, o2) => o2.updatedAt - o1.updatedAt)
)
</script>

<template>
  <div class="h-full">
    <CommonTableWrapper>
      <table v-if="sortedOrderHistories.length > 0" class="table">
        <PartialsCommonSubaccountOrderHistoryHeader />
        <tbody>
          <PartialsCommonSubaccountOrderHistoryRow
            v-for="(order, index) in sortedOrderHistories"
            :key="`order-history-${index}`"
            :is-spot="isSpot"
            :order="order"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyOrders')" />
    </CommonTableWrapper>
  </div>
</template>
