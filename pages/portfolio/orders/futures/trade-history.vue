<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToOrderType,
  derivativeTypeToTradeType
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

function fetchDerivativeTradeHistory() {
  status.setLoading()

  const marketIds = formValues[SpotOrderHistoryFilterField.Market]
    ? derivativeStore.markets
        .filter(
          (market) =>
            market.marketId === formValues[SpotOrderHistoryFilterField.Market]
        )
        .map((market) => market.marketId)
    : undefined

  const executionTypes = derivativeTypeToTradeType(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )
  const orderTypes = derivativeTypeToOrderType(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )

  derivativeStore
    .fetchSubaccountTrades({
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
  fetchDerivativeTradeHistory,
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

  fetchDerivativeTradeHistory()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchDerivativeTradeHistory()
}
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesTradeHistoryTabs />
    <PartialsPortfolioOrdersFuturesTradeHistoryTableHeader />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="8"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesTradeHistoryTableRow
        v-for="trade in derivativeStore.subaccountTrades"
        :key="`${trade.orderHash}-${trade.tradeId}`"
        v-bind="{ trade }"
      />

      <AppPagination
        v-if="derivativeStore.subaccountTrades.length > 0"
        class="p-8"
        v-bind="{
          limit,
          page,
          totalCount: derivativeStore.subaccountTradesCount
        }"
        @update:limit="handleLimitChange"
        @update:page="handlePageChange"
      />

      <CommonEmptyList
        v-if="derivativeStore.subaccountTrades.length === 0"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
