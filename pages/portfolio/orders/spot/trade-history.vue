<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import {
  OrderTypeFilter,
  SpotOrderHistoryFilterField,
  SpotOrderHistoryFilterForm
} from '@/types'
import {
  derivativeTypeToOrderType,
  derivativeTypeToTradeType
} from '~/app/utils/trade'

const route = useRoute()
const router = useRouter()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()
const isMobile = useIsMobile()

const status = reactive(new Status(StatusType.Loading))

const { limit, page, skip } = usePagination({
  totalCount: toRef(spotStore, 'subaccountTradesCount')
})

function fetchTrades() {
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

  const executionTypes = derivativeTypeToTradeType(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )
  const orderTypes = derivativeTypeToOrderType(
    formValues[SpotOrderHistoryFilterField.Type] as OrderTypeFilter
  )

  spotStore
    .fetchSubaccountTrades({
      pagination: {
        skip: skip.value,
        limit: limit.value
      },

      filters: {
        direction,
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

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchTrades()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchTrades()
}

async function fetchData() {
  await router.push({
    query: {
      ...route.query,
      page: undefined
    }
  })

  fetchTrades()
}

onSubaccountChange(fetchData)
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersSpotTradeHistoryTabs
      @form:reset="fetchData"
      @market:update="fetchData"
      @side:update="fetchData"
      @type:update="fetchData"
    />
    <PartialsPortfolioOrdersSpotTradeHistoryTableHeader v-if="!isMobile" />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="8"
      :height="57"
    />
    <template v-else>
      <div v-if="isMobile">
        <PartialsPortfolioOrdersSpotTradeHistoryTableMobileRow
          v-for="trade in spotStore.subaccountTrades"
          :key="`${trade.orderHash}-${trade.tradeId}`"
          v-bind="{ trade }"
        />
      </div>

      <template v-else>
        <PartialsPortfolioOrdersSpotTradeHistoryTableRow
          v-for="trade in spotStore.subaccountTrades"
          :key="`${trade.orderHash}-${trade.tradeId}`"
          v-bind="{ trade }"
        />
      </template>

      <AppPagination
        v-if="spotStore.subaccountTrades.length > 0"
        class="p-8"
        v-bind="{
          limit,
          page,
          totalCount: spotStore.subaccountTradesCount
        }"
        @update:limit="handleLimitChange"
        @update:page="handlePageChange"
      />

      <CommonEmptyList
        v-if="spotStore.subaccountTrades.length === 0"
        :message="$t('trade.emptyOrders')"
      />
    </template>
  </div>
</template>
