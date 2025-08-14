<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { MarketType } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  TradeSubPage,
  StrategyStatus,
  TradingInterface,
  PortfolioTradingBotsRunningTableColumn
} from '@/types'
import type {
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const jsonStore = useSharedJsonStore()
const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()
const { lg } = useSharedBreakpoints()
const { subaccountPortfolioBalanceMap } = useBalance()

const isOpen = ref(false)
const selectedStrategy = ref<
  null | GridStrategyTransformed | DerivativeGridStrategyTransformed
>(null)

const { formattedStrategies: spotFormattedStrategies } = useSpotGridStrategies(
  computed(() => gridStrategyStore.activeSpotStrategies),
  subaccountPortfolioBalanceMap
)

const { formattedStrategies: derivativeFormattedStrategies } =
  useDerivativeGridStrategies(
    computed(() => gridStrategyStore.activeDerivativeStrategies),
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
    class: 'w-32',
    label: t('tradingBots.startTime'),
    key: PortfolioTradingBotsRunningTableColumn.Time
  },
  {
    label: t('trade.market'),
    key: PortfolioTradingBotsRunningTableColumn.Market
  },
  {
    label: t('tradingBots.lowerBound'),
    key: PortfolioTradingBotsRunningTableColumn.LowerBound
  },
  {
    label: t('tradingBots.upperBound'),
    key: PortfolioTradingBotsRunningTableColumn.UpperBound
  },
  {
    label: t('tradingBots.totalAmount'),
    key: PortfolioTradingBotsRunningTableColumn.TotalAmount
  },
  {
    label: t('tradingBots.totalProfit'),
    key: PortfolioTradingBotsRunningTableColumn.TotalProfit
  },
  {
    label: t('tradingBots.duration'),
    key: PortfolioTradingBotsRunningTableColumn.Duration
  },
  {
    label: t('common.details'),
    key: PortfolioTradingBotsRunningTableColumn.Details
  }
  // {
  //   key: PortfolioTradingBotsRunningTableColumn.RemoveStrategy,
  //   label: t('tradingBots.removeStrategy')
  // }
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

          <PartialsLiquidityBotsSpotCommonRemoveStrategy
            v-bind="{
              strategy: row.strategy,
              pnl: row.pnl,
              pnlPercentage: row.percentagePnl
            }"
          >
            <template #default="{ removeStrategy, status }">
              <AppTooltip
                :ui="{ width: 'w-auto' }"
                :is-disabled="!jsonStore.isPostUpgradeMode"
                :content="t('trade.postOnlyWarning')"
              >
                <AppButton
                  :is-loading="
                    status.isLoading() ||
                    row.strategyStatus === StrategyStatus.Pending
                  "
                  class="p-1"
                  variant="danger-ghost"
                  :disabled="jsonStore.isPostUpgradeMode"
                  @click="removeStrategy"
                >
                  <UIcon
                    :name="NuxtUiIcons.Trash"
                    class="size-4 text-red-500"
                  />
                </AppButton>
              </AppTooltip>
            </template>
          </PartialsLiquidityBotsSpotCommonRemoveStrategy>
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
        <div v-if="row.strategyStatus === StrategyStatus.Pending">&mdash;</div>
        <div v-else>
          <div class="flex items-center gap-1">
            <SharedAmountUsd
              v-bind="{
                shouldAbbreviate: false,
                amount: row.totalAmount.toFixed()
              }"
            >
              <template #prefix>$</template>
            </SharedAmountUsd>
          </div>
        </div>
      </template>

      <template #totalProfit-data="{ row }">
        <AppSpinner
          v-if="
            (!row.isSpot && row.isLoadingMarkPrice) ||
            row.strategyStatus === StrategyStatus.Pending
          "
        />
        <div
          v-else
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
          {{ t('tradingBots.moreInfo') }}
        </AppButton>
      </template>

      <!-- <template #removeStrategy-data="{ row }">
        <PartialsLiquidityBotsSpotCommonRemoveStrategy
          v-bind="{
            strategy: row.strategy,
            pnl: row.pnl,
            pnlPercentage: row.percentagePnl
          }"
        >
          <template #default="{ removeStrategy, status }">
            <AppButton
              :is-loading="
                status.isLoading() ||
                row.strategyStatus === StrategyStatus.Pending
              "
              variant="danger-ghost"
              class="p-1"
              @click="removeStrategy"
            >
              <UIcon :name="NuxtUiIcons.Trash" class="size-4 text-red-500" />
            </AppButton>
          </template>
        </PartialsLiquidityBotsSpotCommonRemoveStrategy>
      </template> -->

      <template #empty-state>
        <CommonEmptyList :message="$t('tradingBots.noActiveStrategies')" />
      </template>
    </UTable>

    <template v-else>
      <PartialsTradingBotsGridStrategiesRunningTableMobileRow
        v-for="strategy in formattedStrategies"
        :key="strategy.subaccountId + strategy.createdAt"
        :strategy="strategy"
        :columns="columns"
        @strategy:select="selectStrategy"
      />
    </template>

    <CommonEmptyList
      v-if="gridStrategyStore.activeSpotStrategies.length === 0 && !lg"
      :message="$t('tradingBots.noActiveStrategies')"
    />

    <AppModal v-model="isOpen" v-bind="{ isSm: true }">
      <div class="pt-6">
        <PartialsTradingBotsSpotStrategyDetails
          v-if="
            selectedStrategy &&
            selectedStrategy.strategy.marketType === MarketType.Spot
          "
          :active-strategy="selectedStrategy.strategy"
        />

        <PartialsTradingBotsDerivativeStrategyDetails
          v-else-if="
            selectedStrategy &&
            selectedStrategy.strategy.marketType === MarketType.Derivative
          "
          :active-strategy="selectedStrategy.strategy"
        />
      </div>
    </AppModal>
  </div>
</template>
