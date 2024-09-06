<script lang="ts" setup>
import { UiSpotMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    subaccountId: string
  }>(),
  {}
)

const spotStore = useSpotStore()

useIntervalFn(() => {
  spotStore.fetchOrdersBySubaccount({
    subaccountId: props.subaccountId,
    marketIds: [props.market.marketId]
  })
}, 2000)
</script>

<template>
  <div class="flex flex-col items-center px-2 py-4">
    <p class="text-md font-bold">{{ $t('liquidity.placingOrders') }}</p>
    <AppHocLoading :is-loading="true" />
  </div>
</template>
