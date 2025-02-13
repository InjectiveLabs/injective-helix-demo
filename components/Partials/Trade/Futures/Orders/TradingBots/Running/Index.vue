<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  TradeSubPage,
  TradingInterface,
  DerivativeGridStrategyTransformed,
  PortfolioSpotTradingBotsRunningTableColumn
} from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { subaccountPortfolioBalanceMap } = useBalance()
const { lg } = useSharedBreakpoints()
const { t } = useLang()

const isOpen = ref(false)
const selectedStrategy = ref<DerivativeGridStrategyTransformed | null>(null)

const { formattedStrategies } = useDerivativeGridStrategies(
  computed(() => gridStrategyStore.activeDerivativeStrategies),
  subaccountPortfolioBalanceMap
)

const columns = computed(() => [
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.Time,
    label: t('sgt.time'),
    class: 'w-32'
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.Market,
    label: t('sgt.market')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.LowerBound,
    label: t('sgt.lowerBound')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.UpperBound,
    label: t('sgt.upperBound')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.TotalAmount,
    label: t('sgt.totalAmount')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.TotalProfit,
    label: t('sgt.totalProfit')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.Duration,
    label: t('sgt.duration')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.Details,
    label: t('sgt.details')
  },
  {
    key: PortfolioSpotTradingBotsRunningTableColumn.RemoveStrategy,
    label: t('sgt.removeStrategy')
  }
])

function selectStrategy(strategy: DerivativeGridStrategyTransformed) {
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
          size: 'text-xs',
          font: 'font-normal',
          color: 'text-coolGray-400'
        },
        td: {
          size: 'text-xs',
          color: 'text-white'
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
            name: TradeSubPage.Futures,
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
          <AppAmount
            :max-decimal-places="3"
            :decimal-places="2"
            :amount="row.lowerBound"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #upperBound-data="{ row }">
        <div class="flex items-center gap-1">
          <AppAmount
            :max-decimal-places="3"
            :decimal-places="2"
            :amount="row.upperBound"
          />
          <span>{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #totalAmount-data="{ row }">
        <div class="flex items-center gap-1">
          <AppAmount
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
            <AppAmount
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
      <PartialsTradeFuturesOrdersTradingBotsRunningMobileRow
        v-for="strategy in formattedStrategies"
        :key="strategy.subaccountId + strategy.createdAt"
        :strategy="strategy"
        :columns="columns"
        @strategy:select="selectStrategy"
      />
    </template>

    <CommonEmptyList
      v-if="gridStrategyStore.activeDerivativeStrategies.length === 0 && !lg"
      :message="$t('sgt.noActiveStrategies')"
    />

    <SharedModal v-model="isOpen">
      <PartialsTradingBotsDerivativeStrategyDetails
        v-if="selectedStrategy"
        :active-strategy="selectedStrategy.strategy"
      />
    </SharedModal>
  </div>
</template>
