<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterForm } from '@/types/forms'
import { SpotOpenOrdersFilterField } from '@/types'

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
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersSpotOpenOrdersTabs />

    <div class="overflow-x-auto">
      <div class="divide-y border-b">
        <CommonSkeletonRow
          v-if="status.isLoading()"
          :rows="10"
          :columns="7"
          :height="57"
        />

        <template v-else>
          <PartialsPortfolioOrdersSpotOpenOrdersTable
            v-if="filteredOrders.length"
            :orders="filteredOrders"
            :is-trading-bots="accountStore.isSgtSubaccount"
          />

          <CommonEmptyList
            v-if="!filteredOrders.length"
            :message="$t('trade.emptyOrders')"
          />
        </template>
      </div>
    </div>

    <PartialsLiquidityCommonTradingBotsModalTrigger />
  </div>
</template>
