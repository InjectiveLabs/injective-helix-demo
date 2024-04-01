<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToExecutionTypes,
  derivativeTypeToOrderType
} from '@/app/utils/trade'
import {
  OrderTypeFilter,
  SpotOrderHistoryFilterField,
  SpotOrderHistoryFilterForm
} from '@/types'

const route = useRoute()
const router = useRouter()
const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { limit, page, skip } = usePagination({
  totalCount: toRef(derivativeStore, 'subaccountOrderHistoryCount')
})

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

function fetchDerivativeOrderHistory() {
  status.setLoading()

  const marketIds = formValues[SpotOrderHistoryFilterField.Market]
    ? derivativeStore.markets
        .filter(
          (market) =>
            market.marketId === formValues[SpotOrderHistoryFilterField.Market]
        )
        .map((market) => market.marketId)
    : undefined

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
        direction: formValues[SpotOrderHistoryFilterField.Side] as any,
        orderTypes,
        executionTypes,
        marketIds
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => [accountStore.subaccountId, formValues],
  fetchDerivativeOrderHistory,
  {
    immediate: true,
    deep: true
  }
)

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
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTabs />
    <PartialsPortfolioOrdersFuturesOrderHistoryTableHeader />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="9"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesOrderHistoryTableRow
        v-for="order in derivativeStore.subaccountOrderHistory"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />

      <AppPagination
        v-if="derivativeStore.subaccountOrderHistory.length > 0"
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
        v-if="derivativeStore.subaccountOrderHistory.length === 0"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
