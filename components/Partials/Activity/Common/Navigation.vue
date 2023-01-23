<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { ActivityView } from '@/types'

const props = defineProps({
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
  (e: 'update:view', state: string): void
}>()

const positionStore = usePositionStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const view = computed({
  get(): string {
    return props.view
  },
  set(value: string) {
    emit('update:view', value)
  }
})

const isPositions = computed(() => {
  return (
    view.value === ActivityView.Positions ||
    view.value === ActivityView.FundingPayments
  )
})

const isSpot = computed(() => {
  return (
    view.value === ActivityView.SpotOrders ||
    view.value === ActivityView.SpotTriggers ||
    view.value === ActivityView.SpotOrderHistory ||
    view.value === ActivityView.SpotTradeHistory
  )
})

const isDerivative = computed(() => {
  return (
    view.value === ActivityView.DerivativeOrders ||
    view.value === ActivityView.DerivativeTriggers ||
    view.value === ActivityView.DerivativeOrderHistory ||
    view.value === ActivityView.DerivativeTradeHistory
  )
})

const isWalletHistory = computed(() => {
  return (
    view.value === ActivityView.WalletTransfers ||
    view.value === ActivityView.WalletDeposits ||
    view.value === ActivityView.WalletWithdrawals
  )
})

function handleViewChange(value: string) {
  view.value = value
}
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar min-h-[48px]">
    <div class="flex lg:grid grid-cols-4 gap-4">
      <CommonCardSelect
        v-model="view"
        data-cy="activity-open-positions-panel"
        :option="ActivityView.Positions"
        :status="status"
        :active="isPositions"
        @selected="handleViewChange"
      >
        <template #icon>
          <span class="font-semibold text-sm md:text-lg">
            {{ positionStore.subaccountPositionsCount }}
          </span>
        </template>

        <span class="text-sm whitespace-nowrap">
          {{ $t('activity.positions') }}
        </span>
      </CommonCardSelect>

      <CommonCardSelect
        v-model="view"
        data-cy="activity-spot-orders-panel"
        :option="ActivityView.SpotOrders"
        :status="status"
        :active="isSpot"
        @selected="handleViewChange"
      >
        <template #icon>
          <span class="font-semibold text-sm md:text-lg">
            {{ spotStore.subaccountOrdersCount }}
          </span>
        </template>

        <span class="text-sm whitespace-nowrap">
          {{ $t('activity.spotOrders') }}
        </span>
      </CommonCardSelect>

      <CommonCardSelect
        v-model="view"
        data-cy="activity-derivatives-orders-panel"
        :option="ActivityView.DerivativeOrders"
        :status="status"
        :active="isDerivative"
        @selected="handleViewChange"
      >
        <template #icon>
          <span class="font-semibold text-sm md:text-lg">
            {{ derivativeStore.subaccountOrdersCount }}
          </span>
        </template>

        <span class="text-sm whitespace-nowrap">
          {{ $t('activity.derivativeOrders') }}
        </span>
      </CommonCardSelect>

      <CommonCardSelect
        v-model="view"
        :option="ActivityView.WalletTransfers"
        data-cy="activity-wallet-history-panel"
        :status="status"
        :active="isWalletHistory"
        @selected="handleViewChange"
      >
        <template #icon>
          <BaseIcon name="wallet" class="w-3 md:w-3.5 h-auto" />
        </template>

        <span class="text-sm whitespace-nowrap">
          {{ $t('activity.walletHistory') }}
        </span>
      </CommonCardSelect>
    </div>
  </div>
</template>
