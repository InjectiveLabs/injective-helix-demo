<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '@/app/utils/constants'
import { ActivityView, ActivityField } from '@/types'

const activityStore = useActivityStore()
const bridgeStore = useBridgeStore()
const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  view: {
    type: String,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const emit = defineEmits<{
  (e: 'update:filter'): void
}>()

const cachedEndTime = ref<number | undefined>(undefined)

const { value: page } = useNumberField({
  name: ActivityField.Page,
  initialValue: 1,
  rule: ''
})

const { value: limit, setValue: setLimitValue } = useNumberField({
  name: ActivityField.Limit,
  initialValue: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
  rule: ''
})

const totalCount = computed(() => {
  switch (props.view) {
    case ActivityView.FundingPayments:
      return activityStore.subaccountFundingPaymentsCount
    case ActivityView.SpotOrderHistory:
      return spotStore.subaccountOrderHistoryCount
    case ActivityView.SpotTradeHistory:
      return spotStore.subaccountTradesCount
    case ActivityView.DerivativeOrderHistory:
      return derivativeStore.subaccountOrderHistoryCount
    case ActivityView.DerivativeTradeHistory:
      return derivativeStore.subaccountTradesCount
    case ActivityView.WalletTransfers:
      return bridgeStore.subaccountTransferBridgeTransactionsCount
    default:
      return 0
  }
})

const endTime = computed(() => {
  switch (props.view) {
    case ActivityView.FundingPayments:
      return activityStore.subaccountFundingPayments[0]?.timestamp || 0
    case ActivityView.SpotOrderHistory:
      return spotStore.subaccountOrderHistory[0]?.updatedAt || 0
    case ActivityView.SpotTradeHistory:
      return spotStore.subaccountTrades[0]?.executedAt || 0
    case ActivityView.DerivativeOrderHistory:
      return derivativeStore.subaccountOrderHistory[0]?.updatedAt || 0
    case ActivityView.DerivativeTradeHistory:
      return derivativeStore.subaccountTrades[0]?.executedAt || 0
    default:
      return undefined
  }
})

function handlePageChange(page: string) {
  if (Number(page) === 1) {
    cachedEndTime.value = undefined
  } else if (!cachedEndTime.value) {
    cachedEndTime.value = endTime.value
  }

  emit('update:filter')
}

function handleLimitChange(limit: string) {
  setLimitValue(Number(limit))
  emit('update:filter')
}

const paginationOptions = computed(() => {
  const skip = (page.value - 1) * limit.value
  const isPageOne = skip === 0

  return {
    skip,
    limit: limit.value,
    endTime: isPageOne ? undefined : cachedEndTime.value
  }
})

watch(
  () => props.view,
  () => (cachedEndTime.value = undefined)
)

defineExpose({
  paginationOptions
})
</script>

<template>
  <AppPagination
    v-if="totalCount > 0"
    v-model:page="page"
    v-model:limit="limit"
    class="flex-none mt-4 h-9"
    :row-class="'border border-transparent'"
    :disabled="status.isLoading()"
    :total-count="totalCount"
    @update:page="handlePageChange"
    @update:limit="handleLimitChange"
  >
    <template #rows-prefix>
      <span>{{ $t('pagination.showRows') }}:</span>
    </template>
  </AppPagination>
</template>
