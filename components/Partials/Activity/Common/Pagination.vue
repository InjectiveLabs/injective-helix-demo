<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { ActivityView } from '@/types'

const props = defineProps({
  limit: {
    type: Number,
    required: true
  },

  page: {
    type: Number,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  },

  view: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:page', state: number): void
  (e: 'update:limit', state: number): void
}>()

const activityStore = useActivityStore()
const bridgeStore = useBridgeStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()

const totalCount = computed(() => {
  switch (props.view) {
    case ActivityView.Positions:
      return positionStore.subaccountPositionsCount
    case ActivityView.FundingPayments:
      return activityStore.subaccountFundingPaymentsCount
    case ActivityView.SpotOrders:
      return spotStore.subaccountOrdersCount
    case ActivityView.SpotOrderHistory:
      return spotStore.subaccountOrderHistoryCount
    case ActivityView.SpotTradeHistory:
      return spotStore.subaccountTradesCount
    case ActivityView.DerivativeOrders:
      return derivativeStore.subaccountOrdersCount
    case ActivityView.DerivativeTriggers:
      return derivativeStore.subaccountConditionalOrdersCount
    case ActivityView.DerivativeOrderHistory:
      return derivativeStore.subaccountOrderHistoryCount
    case ActivityView.DerivativeTradeHistory:
      return derivativeStore.subaccountTradesCount
    case ActivityView.WalletTransfers:
      return bridgeStore.subaccountTransferBridgeTransactionsCount
    case ActivityView.WalletDeposits:
    case ActivityView.WalletWithdrawals:
    default:
      return 0
  }
})

const page = computed({
  get(): number {
    return props.page
  },
  set(value: number) {
    emit('update:page', value)
  }
})

const limit = computed({
  get(): number {
    return props.limit
  },
  set(value: number) {
    emit('update:limit', value)
  }
})

function handlePageChange(value: number) {
  page.value = value
}

function handleLimitChange(value: string) {
  limit.value = Number(value)
}
</script>

<template>
  <AppPagination
    v-if="totalCount > 0"
    v-model:page="page"
    v-model:limit="limit"
    class="mt-4"
    :row-class="'border border-transparent'"
    :disabled="status.isLoading()"
    :total-count="totalCount"
    @update:page="handlePageChange"
    @update:limit="handleLimitChange"
  >
    <template #rows-prefix>
      <span>Show rows:</span>
    </template>
  </AppPagination>
</template>
