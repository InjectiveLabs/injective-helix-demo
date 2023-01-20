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
const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

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
  <div class="h-full flex items-center gap-4 overflow-x-auto hide-scrollbar">
    <template v-if="isPositions">
      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-open-positions-link"
        :option="ActivityView.Positions"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.openPositions') }}
          </span>

          <span data-cy="activity-open-positions-link-count">
            ({{ positionStore.subaccountPositionsCount }})
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-funding-payments-link"
        :option="ActivityView.FundingPayments"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.fundingPayments') }}
          </span>
        </div>
      </PartialsActivityCommonTab>
    </template>

    <template v-if="isSpot">
      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-spot-orders-link"
        :option="ActivityView.SpotOrders"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.openOrders') }}
          </span>

          <span data-cy="activity-spot-orders-link-count">
            ({{ spotStore.subaccountOrdersCount }})
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-spot-order-history-link"
        :option="ActivityView.SpotOrderHistory"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.orderHistory') }}
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-spot-trades-link"
        :option="ActivityView.SpotTradeHistory"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.tradeHistory') }}
          </span>
        </div>
      </PartialsActivityCommonTab>
    </template>

    <template v-if="isDerivative">
      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-derivative-orders-link"
        :option="ActivityView.DerivativeOrders"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.openOrders') }}
          </span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ derivativeStore.subaccountOrdersCount }})
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-derivative-triggers-link"
        :option="ActivityView.DerivativeTriggers"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.triggers') }}
          </span>
          <span data-cy="activity-derivative-orders-link-count">
            ({{ derivativeStore.subaccountConditionalOrdersCount }})
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-derivative-order-history-link"
        :option="ActivityView.DerivativeOrderHistory"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.orderHistory') }}
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="activity-derivative-trade-history-link"
        :option="ActivityView.DerivativeTradeHistory"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('activity.tradeHistory') }}
          </span>
        </div>
      </PartialsActivityCommonTab>
    </template>

    <template v-if="isWalletHistory">
      <PartialsActivityCommonTab
        v-model="view"
        data-cy="wallet-history-transfers-link"
        :option="ActivityView.WalletTransfers"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('walletHistory.transfers.transfers') }}
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="wallet-history-deposits-link"
        :option="ActivityView.WalletDeposits"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('walletHistory.deposits') }}
          </span>
        </div>
      </PartialsActivityCommonTab>

      <div class="w-px h-4 bg-gray-500" />

      <PartialsActivityCommonTab
        v-model="view"
        data-cy="wallet-history-withdrawals-link"
        :option="ActivityView.WalletWithdrawals"
        @selected="handleViewChange"
      >
        <div class="flex items-center gap-1">
          <span class="whitespace-nowrap">
            {{ $t('walletHistory.withdrawals') }}
          </span>
        </div>
      </PartialsActivityCommonTab>
    </template>
  </div>
</template>
