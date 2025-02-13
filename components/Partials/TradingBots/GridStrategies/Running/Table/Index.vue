<script setup lang="ts">
import { MarketType } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  DerivativeGridStrategyTransformed,
  GridStrategyTransformed,
  PortfolioTradingBotsRunningTableColumn,
  TradeSubPage,
  TradingInterface
} from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { lg } = useSharedBreakpoints()
const { t } = useLang()
const { subaccountPortfolioBalanceMap } = useBalance()

const isOpen = ref(false)
const selectedStrategy = ref<
  GridStrategyTransformed | DerivativeGridStrategyTransformed | null
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
    key: PortfolioTradingBotsRunningTableColumn.Time,
    label: t('sgt.time'),
    class: 'w-32'
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.Market,
    label: t('sgt.market')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.LowerBound,
    label: t('sgt.lowerBound')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.UpperBound,
    label: t('sgt.upperBound')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.TotalAmount,
    label: t('sgt.totalAmount')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.TotalProfit,
    label: t('sgt.totalProfit')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.Duration,
    label: t('sgt.duration')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.Details,
    label: t('sgt.details')
  },
  {
    key: PortfolioTradingBotsRunningTableColumn.RemoveStrategy,
    label: t('sgt.removeStrategy')
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
          <SharedAmountFormatter
            :decimal-places="2"
            :max-decimal-places="3"
            :amount="row.totalAmount.toFixed()"
          />
        </div>
      </template>

      <template #totalProfit-data="{ row }">
        <div
          class="flex flex-col font-mono"
          :class="{
            'text-green-500': row.isPositivePnl,
            'text-red-500': !row.isPositivePnl && !row.isZeroPnl,
            'text-coolGray-500': row.isZeroPnl
          }"
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

      <template #removeStrategy-data="{ row }">
        <PartialsLiquidityBotsSpotCommonRemoveStrategy :strategy="row.strategy">
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

      <template #empty-state>
        <CommonEmptyList :message="$t('sgt.noActiveStrategies')" />
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
      :message="$t('sgt.noActiveStrategies')"
    />

    <SharedModal v-model="isOpen">
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
    </SharedModal>
  </div>
</template>
