<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToExecutionTypes,
  derivativeTypeToOrderType
} from '@/app/utils/trade'
import {
  ConditionalOrderSide,
  OrderTypeFilter,
  SpotOrderHistoryFilterField,
  SpotOrderHistoryFilterForm
} from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const filterredTriggers = computed(() =>
  derivativeStore.subaccountConditionalOrders.filter((trigger) => {
    const isPartOfMarket = formValues[SpotOrderHistoryFilterField.Market]
      ? trigger.marketId === formValues[SpotOrderHistoryFilterField.Market]
      : true

    const isPartOfType = formValues[SpotOrderHistoryFilterField.Type]
      ? derivativeTypeToOrderType(
          formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
        ).includes(trigger.orderType as ConditionalOrderSide)
      : true

    const isPartOfExecutionType = formValues[SpotOrderHistoryFilterField.Type]
      ? derivativeTypeToExecutionTypes(
          formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
        ).includes(trigger.executionType as ConditionalOrderSide)
      : true

    const isPartOfSide = formValues[SpotOrderHistoryFilterField.Side]
      ? formValues[SpotOrderHistoryFilterField.Side] === trigger.direction
      : true

    return (
      isPartOfMarket && isPartOfType && isPartOfExecutionType && isPartOfSide
    )
  })
)

onSubaccountChange(fetchDerivativeTriggers)

function fetchDerivativeTriggers() {
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
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesTriggersTabs />

    <PartialsPortfolioOrdersFuturesTriggersTableHeader />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="9"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesTriggersTableRow
        v-for="trigger in filterredTriggers"
        :key="`${trigger.orderHash}-${trigger.cid}`"
        v-bind="{ trigger }"
      />

      <CommonEmptyList
        v-if="derivativeStore.subaccountConditionalOrders.length === 0"
        :message="$t('trade.emptyTriggers')"
      />
    </template>
  </div>
</template>
