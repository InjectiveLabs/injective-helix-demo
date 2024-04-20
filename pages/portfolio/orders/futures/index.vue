<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterField, SpotOpenOrdersFilterForm } from '@/types'

const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<SpotOpenOrdersFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const filteredOrders = computed(() =>
  derivativeStore.subaccountOrders.filter((order) => {
    const isPartOfMarket = formValues[SpotOpenOrdersFilterField.Market]
      ? order.marketId === formValues[SpotOpenOrdersFilterField.Market]
      : true

    const isPartOfSide = formValues[SpotOpenOrdersFilterField.Side]
      ? order.orderSide === formValues[SpotOpenOrdersFilterField.Side]
      : true

    return isPartOfMarket && isPartOfSide
  })
)

function fetchDerivativeOpenOrders() {
  status.setLoading()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountConditionalOrders()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(() => [accountStore.subaccountId], fetchDerivativeOpenOrders, {
  immediate: true
})
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTabs />
    <PartialsPortfolioOrdersFuturesOpenOrdersTableHeader />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :height="57"
      :rows="10"
      :columns="8"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesOpenOrdersTableRow
        v-for="order in filteredOrders"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />

      <CommonEmptyList
        v-if="filteredOrders.length === 0"
        :message="'No Open Orders'"
      />
    </template>
  </div>
</template>
