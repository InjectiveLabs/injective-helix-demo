<script setup lang="ts">
import {
  STOP_REASON_MAP,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { PortfolioSpotTradingBotsHistoryTableColumn } from '@/types'
import type {
  StopReason,
  UTableColumn,
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const { t } = useLang()

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

const keysToFilter = [
  PortfolioSpotTradingBotsHistoryTableColumn.Market,
  PortfolioSpotTradingBotsHistoryTableColumn.Details
]

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (
      keysToFilter.includes(
        column.key as PortfolioSpotTradingBotsHistoryTableColumn
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
          class="flex items-center space-x-2 font-mono"
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
            shouldAbbreviate: false,
            amount: strategy.upperBound,
            decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span>{{ strategy.market.quoteToken.symbol }}</span>
      </div>
    </template>

    <template #totalAmount-data>
      <div class="flex items-center gap-1">
        <SharedAmountUsd
          v-bind="{
            shouldAbbreviate: false,
            amount: strategy.totalAmount.toFixed()
          }"
        >
          <template #prefix>
            <span>$</span>
          </template>
        </SharedAmountUsd>
      </div>
    </template>

    <template #totalProfit-data>
      <div
        class="flex flex-col font-mono"
        :class="strategy.isPositivePnl ? 'text-green-500' : 'text-red-500'"
      >
        <div class="flex items-center gap-1">
          <SharedAmount
            v-bind="{
              amount: strategy.pnl,
              useSubscript: true,
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

    <template #stopReason-data>
      <span v-if="strategy.stopReason">
        {{ $t(STOP_REASON_MAP[strategy.stopReason as StopReason]) }}
      </span>
    </template>
  </AppMobileTable>
</template>
