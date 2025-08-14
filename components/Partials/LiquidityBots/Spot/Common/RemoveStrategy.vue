<script setup lang="ts">
import { MarketType } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { StrategyStatus } from '@/types'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'

const props = defineProps<{
  pnl: string
  pnlPercentage: string
  strategy: TradingStrategy
}>()

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
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
          derivativeStore.fetchSecondarySubaccountOrders({
            subaccountId,
            marketIds: [marketId]
          }),
          derivativeStore.fetchOrderHistoryForSubaccount({
            subaccountId
          }),
          derivativeStore.fetchTradesForSubaccount({
            subaccountId
          })
        ])
      }

      notificationStore.update({
        title: t('toast.success'),
        description: t('toast.tradingBots.tradingBotRemovedSuccessfully')
      })

      isOpen.value = true

      // Optimistically update state to pending
      gridStrategyStore.$patch((state) => {
        state.strategies = state.strategies.map((strategy) => {
          if (
            strategy.createdAt === props.strategy.createdAt &&
            strategy.subaccountId === props.strategy.subaccountId
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
      {{ $t('tradingBots.removeStrategy') }}
    </SharedButton>
  </slot>

  <AppModal v-model="isOpen">
    <div class="text-center">
      <img
        src="/svg/loading-dots-circle.svg"
        alt="loading-dots-circle"
        class="w-6 h-6 mx-auto mb-4"
      />

      <h3 class="text-xl font-bold">
        {{ $t('tradingBots.strategyRemovalInitiated') }}
      </h3>

      <div class="text-sm text-coolGray-400 space-y-4 mt-4">
        <p>
          {{ $t('tradingBots.yourTradingStrategyIsBeingRemoved') }}
        </p>

        <div>
          <span>{{ $t('tradingBots.approximateProfit') }}:</span>

          <div
            :class="getColorClassForPnlPercentage(Number(currentPnlPercentage))"
          >
            {{ Number(currentPnlPercentage) > 0 ? '+' : '' }}

            <span
              class="text-nowrap whitespace-nowrap *:text-nowrap *:whitespace-nowrap"
            >
              <SharedAmount
                v-bind="{
                  amount: currentPnl,
                  useSubscript: true,
                  shouldAbbreviate: false
                }"
              />
            </span>
            <span>
              (
              {{ Number(currentPnlPercentage) > 0 ? '+' : '' }}
              {{ currentPnlPercentage }}% )
            </span>
          </div>
        </div>

        <p>{{ $t('tradingBots.youCanCloseThisNotification') }}</p>
      </div>
    </div>

    <AppButton
      variant="primary-outline"
      class="w-full mt-4"
      @click="isOpen = false"
    >
      {{ $t('common.close') }}
    </AppButton>
  </AppModal>
</template>
