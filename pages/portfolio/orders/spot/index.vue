<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterField } from '@/types'
import type { SpotOpenOrdersFilterForm } from '@/types/forms'

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()
const { values: formValues } = useForm<SpotOpenOrdersFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const filteredOrders = computed(() =>
  spotStore.subaccountOrders.filter((order) => {
    const isPartOfMarket = formValues[SpotOpenOrdersFilterField.Market]
      ? order.marketId === formValues[SpotOpenOrdersFilterField.Market]
      : true

    const isPartOfSide = formValues[SpotOpenOrdersFilterField.Side]
      ? order.orderSide === formValues[SpotOpenOrdersFilterField.Side]
      : true

    return isPartOfMarket && isPartOfSide
  })
)

function fetchSubaccountOrders() {
  status.setLoading()

  spotStore
    .fetchSubaccountOrders()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onSubaccountChange(fetchSubaccountOrders)
</script>

<template>
  <div class="divide-y border-t">
    <PartialsPortfolioOrdersSpotOpenOrdersTabs />

    <div class="overflow-x-auto">
      <div class="divide-y">
        <CommonSkeletonRow
          v-if="status.isLoading()"
          :rows="10"
          :columns="7"
          :height="57"
        />

        <PartialsPortfolioOrdersSpotOpenOrdersTable
          v-else
          v-bind="{
            isPortfolioPage: true,
            orders: filteredOrders,
            isTradingBots: accountStore.isSgtSubaccount
          }"
        />
      </div>
    </div>
  </div>
</template>
