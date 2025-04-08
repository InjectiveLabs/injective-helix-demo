<script setup lang="ts">
import { TradingStrategy, MarketType } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'

import { Status, StatusType } from '@injectivelabs/utils'
import { StrategyStatus } from '@/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps<{
  strategy: TradingStrategy
  pnl: string
  pnlPercentage: string
}>()

const toast = useToast()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const isOpen = ref(false)
const currentPnl = ref('')
const currentPnlPercentage = ref('')
const status = reactive(new Status(StatusType.Idle))

function removeStrategy() {
  status.setLoading()

  const isSpot = props.strategy.marketType === MarketType.Spot

  const subaccountId = props.strategy.subaccountId
  const marketId = props.strategy.marketId

  currentPnl.value = props.pnl
  currentPnlPercentage.value = props.pnlPercentage

  gridStrategyStore
    .removeStrategyForSubaccount(
      props.strategy.contractAddress,
      props.strategy.subaccountId
    )
    .then(() => {
      if (isSpot) {
        Promise.all([
          spotStore.fetchOrdersBySubaccount({
            subaccountId,
            marketIds: [marketId]
          }),
          spotStore.fetchOrderHistoryForSubaccount({
            subaccountId,
            filters: {
              marketIds: [marketId]
            }
          }),
          spotStore.fetchTradesForSubaccount({
            subaccountId,
            filters: { marketIds: [marketId] }
          })
        ])
      } else {
        Promise.all([
          derivativeStore.fetchOrdersForSubaccount({
            marketIds: [marketId],
            subaccountId
          }),
          derivativeStore.fetchOrderHistoryForSubaccount({
            subaccountId
          }),
          derivativeStore.fetchTradesForSubaccount({
            subaccountId
          })
        ])
      }

      toast.add({
        title: t('sgt.success'),
        description: t('sgt.gridStrategyRemovedSuccessfully'),
        icon: NuxtUiIcons.Checkmark
      })

      isOpen.value = true

      // Optimistically update state to pending
      gridStrategyStore.$patch((state) => {
        state.strategies = state.strategies.map((strategy) => {
          if (
            strategy.contractAddress !== props.strategy.contractAddress &&
            strategy.subaccountId !== props.strategy.subaccountId
          ) {
            return {
              ...strategy,
              state: StrategyStatus.Pending
            }
          }

          return strategy
        })
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <slot v-bind="{ status, removeStrategy }">
    <SharedButton :loading="status.isLoading()" @click="removeStrategy">
      {{ $t('sgt.removeStrategy') }}
    </SharedButton>
  </slot>

  <AppModal v-model="isOpen">
    <div class="text-center">
      <img
        src="/svg/loading-dots-circle.svg"
        alt="loading-dots-circle"
        class="w-6 h-6 mx-auto mb-4"
      />

      <h3 class="text-xl font-bold">Strategy Removal Initiated</h3>

      <div class="text-sm text-coolGray-400 space-y-4 mt-4">
        <p>
          {{ $t('sgt.yourTradingStrategyIsBeingRemoved') }}
        </p>

        <div>
          <span>{{ $t('sgt.aproximateProfit') }}:</span>

          <div
            :class="getColorClassForPnlPercentage(Number(currentPnlPercentage))"
          >
            {{ Number(currentPnlPercentage) > 0 ? '+' : '' }}

            <SharedAmountFormatter
              class="text-nowrap whitespace-nowrap"
              :max-decimal-places="3"
              :amount="currentPnl"
              :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
            />
            <span>
              (
              {{ Number(currentPnlPercentage) > 0 ? '+' : '' }}
              {{ currentPnlPercentage }}% )
            </span>
          </div>
        </div>

        <p>{{ $t('sgt.youCanCloseThisNotification') }}</p>
      </div>
    </div>

    <AppButton
      variant="primary-outline"
      class="w-full mt-4"
      @click="isOpen = false"
    >
      {{ $t('sgt.close') }}
    </AppButton>
  </AppModal>
</template>
