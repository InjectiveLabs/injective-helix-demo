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
</script>

<template>
  <div class="h-full">
    <CommonTableWrapper class="hidden sm:block">
      <table v-if="orderHistories.length > 0" class="table">
        <PartialsCommonSubaccountOrderHistoryHeader />
        <tbody>
          <PartialsCommonSubaccountOrderHistoryRow
            v-for="(order, index) in orderHistories"
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
