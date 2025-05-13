<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToOrderType,
  derivativeTypeToExecutionTypes
} from '@/app/utils/trade'
import { SpotOrderHistoryFilterField } from '@/types'
import type { OrderTypeFilter, SpotOrderHistoryFilterForm } from '@/types'

const route = useRoute()
const router = useRouter()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { limit, page, skip } = usePagination({
  totalCount: toRef(derivativeStore, 'subaccountOrderHistoryCount')
})

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

function fetchDerivativeOrderHistory() {
  status.setLoading()

  const market = derivativeStore.marketByIdOrSlug(
    formValues[SpotOrderHistoryFilterField.Market]
  )

  const executionTypes = derivativeTypeToExecutionTypes(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )
  const orderTypes = derivativeTypeToOrderType(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )

  derivativeStore
    .fetchSubaccountOrderHistory({
      pagination: {
        skip: skip.value,
        limit: limit.value
      },
      filters: {
        orderTypes,
        executionTypes,
        marketIds: market ? [market.marketId] : undefined,
        direction: formValues[SpotOrderHistoryFilterField.Side] as any
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchDerivativeOrderHistory()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchDerivativeOrderHistory()
}

async function fetchData() {
  await router.push({
    query: {
      ...route.query,
      page: undefined
    }
  })

  fetchDerivativeOrderHistory()
}

onSubaccountChange(fetchData)
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTabs
      @form:reset="fetchData"
      @market:update="fetchData"
      @side:update="fetchData"
      @type:update="fetchData"
    />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="9"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesOrderHistoryTable
        v-if="derivativeStore.subaccountOrderHistory.length"
        :orders="derivativeStore.subaccountOrderHistory"
      />

      <AppPagination
        v-if="derivativeStore.subaccountOrderHistory.length"
        class="p-8"
        v-bind="{
          limit,
          page,
          totalCount: derivativeStore.subaccountOrderHistoryCount
        }"
        @update:limit="handleLimitChange"
        @update:page="handlePageChange"
      />

      <CommonEmptyList
        v-if="!derivativeStore.subaccountOrderHistory.length"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
