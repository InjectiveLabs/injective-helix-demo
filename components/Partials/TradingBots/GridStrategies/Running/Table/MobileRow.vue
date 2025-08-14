<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  StrategyStatus,
  PortfolioSpotTradingBotsRunningTableColumn
} from '@/types'
import type {
  UTableColumn,
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
  }>(),
  {}
)

const emit = defineEmits<{
  'strategy:select': [
    strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
  ]
}>()

const { t } = useLang()

const keysToFilter = [
  PortfolioSpotTradingBotsRunningTableColumn.Market,
  PortfolioSpotTradingBotsRunningTableColumn.Details,
  PortfolioSpotTradingBotsRunningTableColumn.RemoveStrategy
]

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (
      keysToFilter.includes(
        column.key as PortfolioSpotTradingBotsRunningTableColumn
      )
    ) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)

function selectStrategy() {
  emit('strategy:select', props.strategy)
}
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex items-center justify-between mb-4">
        <PartialsCommonMarketRedirection
          class="flex items-center space-x-2 font-sans"
          v-bind="{ market: strategy.market }"
          is-trading-bot-tab
        >
          <CommonTokenIcon
            v-bind="{ token: strategy.market.baseToken }"
            :is-sm="true"
          />
          <p class="text-sm text-coolGray-200">
            {{ strategy.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>

        <div class="flex items-center gap-2">
          <AppButton
            variant="primary-outline"
            size="xs"
            @click="selectStrategy"
          >
            {{ t('common.details') }}
          </AppButton>
          <PartialsLiquidityBotsSpotCommonRemoveStrategy
            v-bind="{
              strategy: strategy.strategy,
              pnl: strategy.pnl,
              pnlPercentage: strategy.percentagePnl
            }"
          >
            <template #default="{ removeStrategy, status }">
              <AppButton
                size="xs"
                :disabled="jsonStore.isPostUpgradeMode"
                :is-loading="
                  status.isLoading() ||
                  strategy.strategyStatus === StrategyStatus.Pending
                "
                variant="danger-shade"
                @click="removeStrategy"
              >
                {{ t('tradingBots.removeStrategy') }}
              </AppButton>
            </template>
          </PartialsLiquidityBotsSpotCommonRemoveStrategy>
        </div>
      </div>
    </template>

    <template #time-data>
      <span class="text-xs">{{ strategy.createdAtFormatted }}</span>
    </template>

    <template #lowerBound-data>
      <div class="flex items-center gap-1">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            amount: strategy.lowerBound,
            shouldAbbreviate: false,
            decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span>{{ strategy.market.quoteToken.symbol }}</span>
      </div>
    </template>

    <template #upperBound-data>
      <div class="flex items-center gap-1">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            amount: strategy.upperBound,
            shouldAbbreviate: false,
            decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span>{{ strategy.market.quoteToken.symbol }}</span>
      </div>
    </template>

    <template #totalAmount-data>
      <div
        v-if="strategy.strategyStatus === StrategyStatus.Pending"
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div v-else class="flex items-center gap-1">
        <SharedAmountUsd
          v-bind="{
            shouldAbbreviate: false,
            amount: strategy.totalAmount.toFixed()
          }"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
      </div>
    </template>

    <template #totalProfit-data>
      <div
        v-if="strategy.strategyStatus === StrategyStatus.Pending"
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div
        v-else
        class="flex flex-col font-sans"
        :class="strategy.isPositivePnl ? 'text-green-500' : 'text-red-500'"
      >
        <div class="flex items-center gap-1">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              amount: strategy.pnl,
              shouldAbbreviate: false
            }"
          >
            <template #prefix>
              <span>{{ strategy.isPositivePnl ? '+' : '' }}</span>
            </template>
          </SharedAmount>
          {{ ' ' + strategy.market.quoteToken.symbol }}
        </div>
        <div>({{ strategy.percentagePnl }}%)</div>
      </div>
    </template>

    <template #duration-data>
      <span>{{ strategy.durationFormatted }}</span>
    </template>

    <template #details-data>
      <AppButton
        size="xs"
        variant="primary-ghost"
        class="text-blue-500 hover:text-blue-500"
        @click="selectStrategy"
      >
        {{ t('common.details') }}
      </AppButton>
    </template>

    <template #removeStrategy-data>
      <PartialsLiquidityBotsSpotCommonRemoveStrategy
        v-bind="{
          pnl: strategy.pnl,
          strategy: strategy.strategy,
          pnlPercentage: strategy.percentagePnl
        }"
      >
        <template #default="{ removeStrategy, status }">
          <AppButton
            :is-loading="status.isLoading()"
            variant="danger-ghost"
            class="p-1"
            @click="removeStrategy"
          >
            <UIcon :name="NuxtUiIcons.Trash" class="size-4 text-red-500" />
          </AppButton>
        </template>
      </PartialsLiquidityBotsSpotCommonRemoveStrategy>
    </template>
  </AppMobileTable>
</template>
