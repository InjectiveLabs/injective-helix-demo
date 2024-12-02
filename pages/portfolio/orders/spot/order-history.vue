<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/sdk-ts'
import {
  SpotOrderHistoryFilterField,
  SpotOrderHistoryFilterForm
} from '@/types'

const route = useRoute()
const router = useRouter()
const spotStore = useSpotStore()

const { $onError } = useNuxtApp()

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const { limit, page, skip } = usePagination({
  totalCount: toRef(spotStore, 'subaccountOrderHistoryCount')
})

function fetchOrderHistory() {
  status.setLoading()

  const marketIds = formValues[SpotOrderHistoryFilterField.Market]
    ? spotStore.markets
        .filter(
          (market) =>
            market.marketId === formValues[SpotOrderHistoryFilterField.Market]
        )
        .map((market) => market.marketId)
    : undefined

  const direction = formValues[
    SpotOrderHistoryFilterField.Side
  ] as TradeDirection

  const executionTypes = formValues[SpotOrderHistoryFilterField.Type]
    ? ([formValues[SpotOrderHistoryFilterField.Type]] as TradeExecutionType[])
    : undefined

  spotStore
    .fetchSubaccountOrderHistory({
      pagination: {
        skip: skip.value,
        limit: limit.value
      },

      filters: {
        direction,
        orderTypes: undefined,
        executionTypes,
        marketIds
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

async function fetchOrders() {
  await router.push({
    query: {
      ...route.query,
      page: undefined
    }
  })

  fetchOrderHistory()
}

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchOrderHistory()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchOrderHistory()
}

onSubaccountChange(fetchOrders)
</script>

<template>
  <div class="divide-y border-y mb-8">
    <PartialsPortfolioOrdersSpotOrderHistoryTabs
      @form:reset="fetchOrders"
      @market:update="fetchOrders"
      @side:update="fetchOrders"
      @type:update="fetchOrders"
    />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="9"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersSpotOrderHistoryTable
        v-if="spotStore.subaccountOrderHistory.length"
        :orders="spotStore.subaccountOrderHistory"
      />

      <AppPagination
        v-if="spotStore.subaccountOrderHistory.length"
        class="p-8"
        v-bind="{
          limit,
          page,
          totalCount: spotStore.subaccountOrderHistoryCount
        }"
        @update:limit="handleLimitChange"
        @update:page="handlePageChange"
      />

      <CommonEmptyList
        v-if="!spotStore.subaccountOrderHistory.length"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
