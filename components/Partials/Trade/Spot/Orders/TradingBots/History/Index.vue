<script setup lang="ts">
import {
  STOP_REASON_MAP,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  StopReason,
  TradeSubPage,
  TradingInterface,
  GridStrategyTransformed,
  PortfolioSpotTradingBotsHistoryTableColumn
} from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { subaccountPortfolioBalanceMap } = useBalance()
const { lg } = useTwBreakpoints()
const { t } = useLang()

const isOpen = ref(false)
const selectedStrategy = ref<GridStrategyTransformed | null>(null)

const { formattedStrategies } = useSpotGridStrategies(
  computed(() => gridStrategyStore.removedStrategies),
  subaccountPortfolioBalanceMap
)

const columns = computed(() => [
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.Time,
    label: t('sgt.time'),
    class: 'w-32'
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.Market,
    label: t('sgt.market')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.LowerBound,
    label: t('sgt.lowerBound')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.UpperBound,
    label: t('sgt.upperBound')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.TotalAmount,
    label: t('sgt.totalAmount')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.TotalProfit,
    label: t('sgt.totalProfit')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.Duration,
    label: t('sgt.duration')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.Details,
    label: t('sgt.details')
  },
  {
    key: PortfolioSpotTradingBotsHistoryTableColumn.StopReason,
    label: t('sgt.stopReason')
  }
])

function selectStrategy(strategy: GridStrategyTransformed) {
  selectedStrategy.value = strategy
  isOpen.value = true
}
</script>

<template>
  <div>
    <UTable
      v-if="lg"
      :ui="{
        divide: 'dark:divide-cool-800',
        th: {
          color: 'text-coolGray-400',
          size: 'text-xs',
          font: 'font-normal'
        },
        td: {
          color: 'text-white',
          size: 'text-xs'
        }
      }"
      :rows="formattedStrategies"
      :columns="columns"
    >
      <template #time-data="{ row }">
        <span class="p-2 text-xs">{{ row.createdAtFormatted }}</span>
      </template>

      <template #market-data="{ row }">
        <NuxtLink
          :to="{
            name: TradeSubPage.Spot,
            query: {
              interface: TradingInterface.TradingBots
            },
            params: {
              slug: row.market.slug
            }
          }"
          class="flex items-center gap-2"
        >
          <UAvatar size="xs" :src="row.market.baseToken.logo" />
          <span>{{ row.market.ticker }}</span>
        </NuxtLink>
      </template>

      <template #lowerBound-data="{ row }">
        <div class="flex items-center gap-1">
          <SharedAmountFormatter
            :max-decimal-places="3"
            :decimal-places="2"
            :amount="row.lowerBound"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #upperBound-data="{ row }">
        <div class="flex items-center gap-1">
          <SharedAmountFormatter
            :max-decimal-places="3"
            :decimal-places="2"
            :amount="row.upperBound"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #totalAmount-data="{ row }">
        <div class="flex items-center gap-1">
          <AppUsdAmount
            :decimal-places="4"
            :amount="row.totalAmount.toFixed()"
          />
        </div>
      </template>

      <template #totalProfit-data="{ row }">
        <div
          class="flex flex-col"
          :class="row.isPositivePnl ? 'text-green-500' : 'text-red-500'"
        >
          <div class="flex items-center gap-1">
            <span>{{ row.isPositivePnl ? '+' : '' }}</span>
            <SharedAmountFormatter
              :max-decimal-places="3"
              :amount="row.pnl"
              :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
            />
            {{ ' ' + row.market.quoteToken.symbol }}
          </div>
          <div>({{ row.percentagePnl }}%)</div>
        </div>
      </template>

      <template #duration-data="{ row }">
        <span>{{ row.durationFormatted }}</span>
      </template>

      <template #details-data="{ row }">
        <AppButton
          size="xs"
          variant="primary-ghost"
          class="text-blue-500 hover:text-blue-500"
          @click="selectStrategy(row)"
        >
          {{ t('sgt.details') }}
        </AppButton>
      </template>

      <template #stopReason-data="{ row }">
        <span v-if="row.stopReason">
          {{ $t(STOP_REASON_MAP[row.stopReason as StopReason]) }}
        </span>
      </template>

      <template #empty-state>
        <CommonEmptyList :message="$t('sgt.noActiveStrategies')" />
      </template>
    </UTable>

    <template v-else>
      <PartialsTradeSpotOrdersTradingBotsHistoryTableMobileRow
        v-for="strategy in formattedStrategies"
        :key="strategy.marketId + strategy.strategy.createdAt"
        :strategy="strategy"
        :columns="columns"
        @strategy:select="selectStrategy"
      />
    </template>

    <CommonEmptyList
      v-if="gridStrategyStore.activeSpotStrategies.length === 0 && !lg"
      :message="$t('sgt.noActiveStrategies')"
    />

    <SharedModal v-model="isOpen">
      <PartialsLiquidityCommonActiveStrategyDetails
        v-if="selectedStrategy"
        :active-strategy="selectedStrategy.strategy"
      />
    </SharedModal>
  </div>
</template>
