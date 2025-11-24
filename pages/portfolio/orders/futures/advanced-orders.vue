<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToOrderType,
  derivativeTypeToExecutionTypes
} from '@/app/utils/trade'
import { SpotOrderHistoryFilterField } from '@/types'
import type {
  OrderTypeFilter,
  ConditionalOrderSide,
  SpotOrderHistoryFilterForm
} from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const filteredAdvancedOrders = computed(() =>
  derivativeStore.subaccountConditionalOrders.filter((advancedOrders) => {
    const isPartOfMarket = formValues[SpotOrderHistoryFilterField.Market]
      ? advancedOrders.marketId ===
        formValues[SpotOrderHistoryFilterField.Market]
      : true

    const isPartOfType = formValues[SpotOrderHistoryFilterField.Type]
      ? (
          derivativeTypeToOrderType(
            formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
          ) || []
        ).includes(advancedOrders.orderType as ConditionalOrderSide)
      : true

    const isPartOfExecutionType = formValues[SpotOrderHistoryFilterField.Type]
      ? derivativeTypeToExecutionTypes(
          formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
        ).includes(advancedOrders.executionType as ConditionalOrderSide)
      : true

    const isPartOfSide = formValues[SpotOrderHistoryFilterField.Side]
      ? formValues[SpotOrderHistoryFilterField.Side] ===
        advancedOrders.orderSide
      : true

    return (
      isPartOfMarket && isPartOfType && isPartOfExecutionType && isPartOfSide
    )
  })
)

onSubaccountChange(fetchAdvancedOrders)

function fetchAdvancedOrders() {
  status.setLoading()

  derivativeStore
    .fetchSubaccountConditionalOrders()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="divide-y border-t">
    <PartialsPortfolioOrdersFuturesAdvancedOrdersTabs />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="9"
      :height="57"
    />

    <PartialsPortfolioOrdersFuturesAdvancedOrdersTable
      v-else
      :advanced-orders="filteredAdvancedOrders"
    />
  </div>
</template>
