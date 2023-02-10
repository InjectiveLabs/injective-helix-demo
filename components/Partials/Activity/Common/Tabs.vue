<script lang="ts" setup>
import { PropType } from 'vue'
import { ActivityTab, ActivityView } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()

const props = defineProps({
  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  },

  view: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:view', state: string): void
}>()

const view = computed({
  get: (): string => props.view,
  set: (value: string) => {
    emit('update:view', value)
  }
})

const tabViewList = computed(() => {
  if (props.tab === ActivityTab.Positions) {
    return [ActivityView.Positions, ActivityView.FundingPayments]
  }

  if (props.tab === ActivityTab.Derivatives) {
    return [
      ActivityView.DerivativeOrders,
      ActivityView.DerivativeTriggers,
      ActivityView.DerivativeOrderHistory,
      ActivityView.DerivativeTradeHistory
    ]
  }

  if (props.tab === ActivityTab.Spot) {
    return [
      ActivityView.SpotOrders,
      ActivityView.SpotOrderHistory,
      ActivityView.SpotTradeHistory
    ]
  }

  return [
    ActivityView.WalletTransfers,
    ActivityView.WalletDeposits,
    ActivityView.WalletWithdrawals
  ]
})
</script>

<template>
  <div class="flex items-center gap-4 overflow-x-auto hide-scrollbar flex-none">
    <template
      v-for="(viewOption, index) in Object.values(tabViewList)"
      :key="`activity-tab-${viewOption}`"
    >
      <AppSelectButton v-model="view" :value="viewOption">
        <template #default="{ active }">
          <div
            class="text-xs xs:text-sm leading-5 tracking-wide cursor-pointer uppercase"
            :class="[
              active
                ? 'text-blue-500 hover:text-blue-600 font-bold'
                : 'text-gray-500 hover:text-blue-500'
            ]"
          >
            <div class="flex items-center gap-1">
              <span class="whitespace-nowrap">
                <span v-if="viewOption === ActivityView.Positions">
                  {{ $t('activity.openPositions') }}
                </span>

                <span v-else-if="viewOption === ActivityView.FundingPayments">
                  {{ $t('activity.fundingPayments') }}
                </span>

                <span
                  v-else-if="
                    [
                      ActivityView.DerivativeOrders,
                      ActivityView.SpotOrders
                    ].includes(viewOption)
                  "
                >
                  {{ $t('activity.openOrders') }}
                </span>

                <span
                  v-else-if="
                    [
                      ActivityView.DerivativeOrderHistory,
                      ActivityView.SpotOrderHistory
                    ].includes(viewOption)
                  "
                >
                  {{ $t('activity.orderHistory') }}
                </span>

                <span
                  v-else-if="
                    [
                      ActivityView.DerivativeTradeHistory,
                      ActivityView.SpotTradeHistory
                    ].includes(viewOption)
                  "
                >
                  {{ $t('activity.tradeHistory') }}
                </span>

                <span
                  v-else-if="viewOption === ActivityView.DerivativeTriggers"
                >
                  {{ $t('activity.triggers') }}
                </span>

                <span v-if="viewOption === ActivityView.WalletTransfers">
                  {{ $t('walletHistory.transfers.transfers') }}
                </span>

                <span v-if="viewOption === ActivityView.WalletDeposits">
                  {{ $t('walletHistory.deposits') }}
                </span>

                <span v-if="viewOption === ActivityView.WalletWithdrawals">
                  {{ $t('walletHistory.withdrawals') }}
                </span>
              </span>

              <!-- Count display -->
              <span
                v-if="viewOption === ActivityView.Positions"
                id="activity-position-tab-count"
              >
                <span id="activity-position-tab-count-default">
                  ({{ positionStore.subaccountPositionsCount }})
                </span>
              </span>

              <span
                v-if="viewOption === ActivityView.SpotOrders"
                id="activity-spot-tab-count"
              >
                <span id="activity-spot-tab-count-default">
                  ({{ spotStore.subaccountOrdersCount }})
                </span>
              </span>

              <span
                v-if="viewOption === ActivityView.DerivativeOrders"
                id="activity-derivative-tab-count"
              >
                <span id="activity-derivative-tab-count-default">
                  ({{ derivativeStore.subaccountOrdersCount }})
                </span>
              </span>

              <span
                v-if="viewOption === ActivityView.DerivativeTriggers"
                id="activity-derivative-triggers-tab-count"
              >
                <span id="activity-derivative-triggers-tab-count-default">
                  ({{ derivativeStore.subaccountConditionalOrdersCount }})
                </span>
              </span>
            </div>
          </div>
        </template>
      </AppSelectButton>

      <CommonSeparator v-if="index !== Object.values(tabViewList).length - 1" />
    </template>
  </div>
</template>
