<script setup lang="ts">
import {
  STOP_REASON_MAP,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  TradeSubPage,
  TradingInterface,
  PortfolioTradingBotsHistoryTableColumn
} from '@/types'
import type {
  StopReason,
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { subaccountPortfolioBalanceMap } = useBalance()
const { lg } = useSharedBreakpoints()
const { t } = useLang()

const isOpen = ref(false)
const selectedStrategy = ref<
  null | GridStrategyTransformed | DerivativeGridStrategyTransformed
>(null)

const { formattedStrategies: spotFormattedStrategies } = useSpotGridStrategies(
  computed(() => gridStrategyStore.removedSpotStrategies),
  subaccountPortfolioBalanceMap
)

const { formattedStrategies: derivativeFormattedStrategies } =
  useDerivativeGridStrategies(
    computed(() => gridStrategyStore.removedDerivativeStrategies),
    subaccountPortfolioBalanceMap
  )

const formattedStrategies = computed(() =>
  [
    ...spotFormattedStrategies.value,
    ...derivativeFormattedStrategies.value
  ].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
)

const columns = computed(() => [
  {
    key: PortfolioTradingBotsHistoryTableColumn.Time,
    label: t('tradingBots.time'),
    class: 'w-32'
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.Market,
    label: t('trade.market')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.LowerBound,
    label: t('tradingBots.lowerBound')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.UpperBound,
    label: t('tradingBots.upperBound')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.TotalAmount,
    label: t('tradingBots.totalAmount')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.TotalProfit,
    label: t('tradingBots.totalProfit')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.Duration,
    label: t('tradingBots.duration')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.Details,
    label: t('common.details')
  },
  {
    key: PortfolioTradingBotsHistoryTableColumn.StopReason,
    label: t('tradingBots.stopReason')
  }
])

function selectStrategy(
  strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
) {
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
            name: row.isSpot ? TradeSubPage.Spot : TradeSubPage.Futures,
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
          <SharedAmount
            v-bind="{
              useSubscript: true,
              amount: row.lowerBound,
              shouldAbbreviate: false,
              decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #upperBound-data="{ row }">
        <div class="flex items-center gap-1">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              amount: row.upperBound,
              shouldAbbreviate: false,
              decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #totalAmount-data="{ row }">
        <div class="flex items-center gap-1">
          <SharedAmountUsd
            v-bind="{
              shouldAbbreviate: false,
              amount: row.totalAmount.toFixed()
            }"
          >
            <template #prefix>
              <span>$</span>
            </template>
          </SharedAmountUsd>
        </div>
      </template>

      <template #totalProfit-data="{ row }">
        <div
          class="flex flex-col font-sans"
          :class="{
            'text-green-500': row.isPositivePnl,
            'text-red-500': !row.isPositivePnl && !row.isZeroPnl,
            'text-coolGray-500': row.isZeroPnl
          }"
        >
          <div class="flex items-center gap-1">
            <SharedAmount
              v-bind="{
                amount: row.pnl,
                useSubscript: true,
                shouldAbbreviate: false
              }"
            >
              <template #prefix>
                <span>{{ row.isPositivePnl ? '+' : '' }}</span>
              </template>
            </SharedAmount>
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
          {{ t('common.details') }}
        </AppButton>
      </template>

      <template #stopReason-data="{ row }">
        <span v-if="row.stopReason">
          {{ $t(STOP_REASON_MAP[row.stopReason as StopReason]) }}
        </span>
      </template>

      <template #empty-state>
        <CommonEmptyList :message="$t('tradingBots.noActiveStrategies')" />
      </template>
    </UTable>

    <template v-else>
      <PartialsTradingBotsGridStrategiesHistoryTableMobileRow
        v-for="strategy in formattedStrategies"
        :key="strategy.marketId + strategy.strategy.createdAt"
        :strategy="strategy"
        :columns="columns"
        @strategy:select="selectStrategy"
      />
    </template>

    <CommonEmptyList
      v-if="gridStrategyStore.removedDerivativeStrategies.length === 0 && !lg"
      :message="$t('tradingBots.noStrategies')"
    />

    <AppModal v-model="isOpen" v-bind="{ isSm: true }">
      <div class="pt-6">
        <PartialsTradingBotsSpotStrategyDetails
          v-if="selectedStrategy && selectedStrategy.isSpot"
          :active-strategy="selectedStrategy.strategy"
        />

        <PartialsTradingBotsDerivativeStrategyDetails
          v-if="selectedStrategy && !selectedStrategy.isSpot"
          :active-strategy="selectedStrategy.strategy"
        />
      </div>
    </AppModal>
  </div>
</template>
