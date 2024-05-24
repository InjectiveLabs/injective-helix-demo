<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterField } from '@/types'
import { SpotOpenOrdersFilterForm } from '@/types/forms'

const spotStore = useSpotStore()
const { $onError } = useNuxtApp()
const { values: formValues } = useForm<SpotOpenOrdersFilterForm>()
const isMobile = useIsMobile()

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
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersSpotOpenOrdersTabs />
    <PartialsPortfolioOrdersSpotOpenOrdersTableHeader v-if="!isMobile" />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="7"
      :height="57"
    />

    <template v-else>
      <template v-if="isMobile">
        <PartialsPortfolioOrdersSpotOpenOrdersTableMobileRow
          v-for="order in filteredOrders"
          v-bind="{ order }"
          :key="order.orderHash"
        />
      </template>
      <template v-else>
        <PartialsPortfolioOrdersSpotOpenOrdersTableRow
          v-for="order in filteredOrders"
          v-bind="{ order }"
          :key="order.orderHash"
        />
      </template>

      <CommonEmptyList
        v-if="filteredOrders.length === 0"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
