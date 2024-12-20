<script setup lang="ts">
import {
  STOP_REASON_MAP,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  BotType,
  GridStrategyTransformed,
  MainPage,
  StopReason,
  TradeSubPage,
  TradingInterface
} from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()

const isOpen = ref(false)
const selectedStrategy = ref<GridStrategyTransformed | null>(null)

const { formattedStrategies } = useSpotGridStrategies(
  computed(() => gridStrategyStore.removedStrategies)
)

const columns = computed(() => [
  { key: 'time', label: t('sgt.time'), class: 'w-32' },
  { key: 'market', label: t('sgt.market') },
  { key: 'lowerBound', label: t('sgt.lowerBound') },
  { key: 'upperBound', label: t('sgt.upperBound') },
  { key: 'totalAmount', label: t('sgt.totalAmount') },
  { key: 'totalProfit', label: t('sgt.totalProfit') },
  { key: 'duration', label: t('sgt.duration') },
  { key: 'details', label: t('sgt.details') },
  { key: 'stopReason', label: t('sgt.stopReason') }
])

function selectStrategy(strategy: GridStrategyTransformed) {
  selectedStrategy.value = strategy
  isOpen.value = true
}
</script>

<template>
  <div>
    <UTable
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
            name:
              row.botType === BotType.SpotGrid
                ? TradeSubPage.Spot
                : MainPage.TradingBotsLiquidityBotsSpot,
            query: {
              market:
                row.botType === BotType.LiquidityGrid
                  ? row.market.slug
                  : undefined,
              interface:
                row.botType === BotType.SpotGrid
                  ? TradingInterface.TradingBots
                  : undefined
            },
            params: {
              slug:
                row.botType === BotType.SpotGrid ? row.market.slug : undefined
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
          class="flex flex-col font-mono"
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
    </UTable>

    <CommonEmptyList
      v-if="gridStrategyStore.activeStrategies.length === 0"
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
