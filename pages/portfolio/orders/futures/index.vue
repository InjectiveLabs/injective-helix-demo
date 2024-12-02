<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterField, SpotOpenOrdersFilterForm } from '@/types'

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

onSubaccountChange(fetchDerivativeOpenOrders)
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTabs />
    <div class="overflow-x-auto">
      <div class="lg:min-w-[1200px] divide-y border-b">
        <CommonSkeletonRow
          v-if="status.isLoading()"
          :height="57"
          :rows="10"
          :columns="8"
        />

        <template v-else>
          <PartialsPortfolioOrdersFuturesOpenOrdersTable
            v-if="filteredOrders.length"
            :orders="filteredOrders"
          />

          <CommonEmptyList
            v-if="!filteredOrders.length"
            :message="'No Open Orders'"
          />
        </template>
      </div>
    </div>
  </div>
</template>
