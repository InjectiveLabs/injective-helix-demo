<script setup lang="ts">
import { TradingStrategy, MarketType } from '@injectivelabs/sdk-ts'

import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps<{
  strategy: TradingStrategy
}>()

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

function removeStrategy() {
  status.setLoading()

  const isSpot = props.strategy.marketType === MarketType.Spot

  const subaccountId = props.strategy.subaccountId
  const marketId = props.strategy.marketId

  gridStrategyStore
    .removeStrategyForSubaccount(
      props.strategy.contractAddress,
      props.strategy.subaccountId
    )
    .then(() => {
      if (isSpot) {
        Promise.all([
          spotStore.fetchOrdersBySubaccount({
            subaccountId,
            marketIds: [marketId]
          }),
          spotStore.fetchOrderHistoryForSubaccount({
            subaccountId,
            filters: {
              marketIds: [marketId]
            }
          }),
          spotStore.fetchTradesForSubaccount({
            subaccountId,
            filters: { marketIds: [marketId] }
          })
        ])
      } else {
        Promise.all([
          derivativeStore.fetchOrdersForSubaccount({
            marketIds: [marketId],
            subaccountId
          }),
          derivativeStore.fetchOrderHistoryForSubaccount({
            subaccountId
          }),
          derivativeStore.fetchTradesForSubaccount({
            subaccountId
          })
        ])
      }
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <slot v-bind="{ status, removeStrategy }">
    <SharedButton :loading="status.isLoading()" @click="removeStrategy">
      Remove Strategy
    </SharedButton>
  </slot>
</template>
