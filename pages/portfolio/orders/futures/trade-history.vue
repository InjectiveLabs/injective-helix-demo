<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  derivativeTypeToOrderType,
  derivativeTypeToTradeType
} from '@/app/utils/trade'
import { Modal, SpotOrderHistoryFilterField } from '@/types'
import type { SharedUiDerivativeTrade } from '@shared/types'
import type { OrderTypeFilter, SpotOrderHistoryFilterForm } from '@/types'

const route = useRoute()
const router = useRouter()
const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { limit, page, skip } = usePagination({
  totalCount: toRef(derivativeStore, 'subaccountOrderHistoryCount')
})

const { values: formValues } = useForm<SpotOrderHistoryFilterForm>()

const status = reactive(new Status(StatusType.Loading))

const selectedTrade = ref<undefined | SharedUiDerivativeTrade>(undefined)

function fetchDerivativeTradeHistory() {
  status.setLoading()

  const market = derivativeStore.marketByIdOrSlug(
    formValues[SpotOrderHistoryFilterField.Market]
  )

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

function resetSelectedTrade() {
  selectedTrade.value = undefined
}

function onShareTrade(trade: SharedUiDerivativeTrade) {
  selectedTrade.value = trade
  modalStore.openModal(Modal.ShareTradePnl)
}

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

async function fetchData() {
  await router.push({
    query: {
      ...route.query,
      page: undefined
    }
  })

  fetchDerivativeTradeHistory()
}

onSubaccountChange(fetchData)
</script>

<template>
  <div class="divide-y border-t">
    <PartialsPortfolioOrdersFuturesTradeHistoryTabs
      @form:reset="fetchData"
      @market:update="fetchData"
      @side:update="fetchData"
      @type:update="fetchData"
    />

    <CommonSkeletonRow
      v-if="status.isLoading()"
      :rows="10"
      :columns="8"
      :height="57"
    />

    <template v-else>
      <PartialsPortfolioOrdersFuturesTradeHistoryTable
        :trades="derivativeStore.subaccountTrades"
        @trade:share="onShareTrade"
      />

      <AppPagination
        v-if="derivativeStore.subaccountTrades.length"
        class="p-8"
        v-bind="{
          limit,
          page,
          totalCount: derivativeStore.subaccountTradesCount
        }"
        @update:limit="handleLimitChange"
        @update:page="handlePageChange"
      />
    </template>
  </div>

  <ModalsSharePnlDerivativeTrade
    v-if="selectedTrade"
    v-bind="{ trade: selectedTrade }"
    @on:close="resetSelectedTrade"
  />
</template>
