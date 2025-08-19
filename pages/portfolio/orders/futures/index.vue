<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOpenOrdersFilterField } from '@/types'
import type { SpotOpenOrdersFilterForm } from '@/types'

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

onSubaccountChange(fetchDerivativeOpenOrders)
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTabs
      :is-trading-bots="accountStore.isSgtSubaccount"
    />
    <div class="overflow-x-auto">
      <div class="lg:min-w-[1200px] divide-y border-b">
        <CommonSkeletonRow
          v-if="status.isLoading()"
          :rows="10"
          :height="57"
          :columns="8"
        />

        <template v-else>
          <PartialsPortfolioOrdersFuturesOpenOrdersTable
            v-if="filteredOrders.length"
            :orders="filteredOrders"
            :is-trading-bots="accountStore.isSgtSubaccount"
          />

          <CommonEmptyList
            v-if="!filteredOrders.length"
            :message="$t('trade.noOpenOrders')"
          />
        </template>
      </div>
    </div>
  </div>
</template>
