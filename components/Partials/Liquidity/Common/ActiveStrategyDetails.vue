<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  STOP_REASON_MAP,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    activeStrategy: TradingStrategy
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Idle))

const { formattedStrategies: strategies, status: lastTradedPriceStatus } =
  useSpotGridStrategies(
    computed(() => props.activeStrategy),
    subaccountPortfolioBalanceMap
  )

const strategy = computed(() => strategies.value[0])

const isPositivePnl = computed(() =>
  new BigNumberInBase(strategy.value.pnl).gte(0)
)

const percentagePnl = computed(() =>
  new BigNumberInBase(strategy.value.percentagePnl).toFormat(2)
)

function removeStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategyForSubaccount(
      strategy.value.contractAddress,
      strategy.value.subaccountId
    )
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div v-if="strategy" class="text-sm space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-lg font-bold">
        {{ $t('sgt.gridDetails') }}
      </p>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="strategy.isActive ? 'bg-green-500' : 'bg-red-500'"
        />
        <p>{{ strategy.isActive ? $t('sgt.running') : $t('sgt.removed') }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">{{ $t('liquidityBots.totalProfit') }}</p>

      <div v-if="lastTradedPriceStatus.isLoading()" class="text-coolGray-400">
        &mdash;
      </div>
      <div
        v-else
        class="font-bold flex items-center"
        :class="isPositivePnl ? 'text-green-500' : 'text-red-500'"
      >
        <span>{{ isPositivePnl ? '+' : '' }}</span>
        <SharedAmountFormatter
          :max-decimal-places="3"
          :amount="strategy.pnl"
          :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
        />
        <span>
          {{ ' ' + strategy.market.quoteToken.symbol }} / ({{ percentagePnl }}%)
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('liquidityBots.totalAmount') }}
      </p>

      <div v-if="lastTradedPriceStatus.isLoading()" class="text-coolGray-400">
        &mdash;
      </div>
      <div v-else>
        $
        <SharedAmountFormatter
          :max-decimal-places="3"
          :amount="strategy.totalAmount.toFixed()"
          :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        />
        USD
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        <span v-if="strategy.isActive">
          {{ $t('liquidityBots.currentBalance') }}
        </span>
        <span v-else>{{ $t('liquidityBots.finalBalance') }}</span>
      </p>

      <div>
        <PartialsLiquidityCommonDetailsPair
          v-bind="{ market: strategy.market }"
        >
          <template #base>
            <SharedAmountFormatter
              :amount="strategy.finalBaseBalanceQuantity"
              :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
              :max-decimal-places="3"
            />
          </template>
          <template #quote>
            <SharedAmountFormatter
              :amount="strategy.finalQuoteBalanceQuantity"
              :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
              :max-decimal-places="3"
            />
          </template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="border-t border-coolGray-800 !my-4" />

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">{{ $t('liquidityBots.timeCreated') }}</p>

      <div>
        {{ strategy.createdAtFormatted }}
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">{{ $t('liquidityBots.duration') }}</p>

      <div>
        {{ strategy.durationFormatted }}
      </div>
    </div>

    <div class="border-t border-coolGray-800 !my-4" />

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right">
        <PartialsLiquidityCommonDetailsPair
          v-bind="{
            baseSymbol: strategy.market.quoteToken.symbol,
            quoteSymbol: strategy.market.quoteToken.symbol
          }"
        >
          <template #base>{{ strategy.lowerBound }}</template>
          <template #quote>{{ strategy.upperBound }}</template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.initialAmount') }}</p>
      <div class="text-right">
        <PartialsLiquidityCommonDetailsPair
          v-bind="{
            market: strategy.market
          }"
        >
          <template #base>{{ strategy.initialBaseBalanceQuantity }}</template>
          <template #quote>{{ strategy.initialQuoteBalanceQuantity }}</template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.initialEntryPrice') }}</p>
      <div class="text-right">
        <SharedAmountFormatter
          :amount="strategy.executionPrice"
          :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
          :max-decimal-places="8"
        />
        <span class="text-coolGray-400 text-xs">
          {{ ' ' + strategy.market.quoteToken.symbol }}
        </span>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.numberOfGrids') }}</p>
      <div class="text-right">
        {{ strategy.numberOfGridLevels }}
      </div>
    </div>

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.advanced.settleIn') }}</span>
      </span>

      <span>
        {{ strategy.settleIn ? strategy.settleIn : $t('sgt.disabled') }}
      </span>
    </div>

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.takeProfit') }}</span>
      </span>

      <div>
        <span v-if="!strategy.takeProfit">{{ $t('sgt.disabled') }}</span>
        <span v-else>
          {{ strategy.takeProfit.exitPrice }} /
          {{ strategy.takeProfit.exitType }}
        </span>
      </div>
    </div>

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.stopLoss') }}</span>
      </span>

      <div>
        <span v-if="!strategy.stopLoss">{{ $t('sgt.disabled') }}</span>
        <span v-else>
          {{ strategy.stopLoss.exitPrice }} /
          {{ strategy.stopLoss.exitType }}
        </span>
      </div>
    </div>

    <div
      v-if="strategy.trailingUpper"
      class="flex justify-between mb-2 text-sm"
    >
      <p class="text-coolGray-400">
        {{ $t('liquidityBots.trailingUpper') }}
      </p>
      <div class="text-right">
        {{ strategy.trailingUpper }}
      </div>
    </div>

    <div
      v-if="strategy.trailingLower"
      class="flex justify-between mb-2 text-sm"
    >
      <p class="text-coolGray-400">
        {{ $t('liquidityBots.trailingLower') }}
      </p>
      <div class="text-right">
        {{ strategy.trailingLower }}
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">
        {{ $t('sgt.gridMode') }}
      </p>
      <div class="text-right">
        {{ $t(`sgt.modes.${strategy.strategyType}`) }}
      </div>
    </div>

    <div v-if="strategy.stopReason" class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">
        {{ $t('sgt.stopReason') }}
      </p>
      <div class="text-right">
        {{ $t(STOP_REASON_MAP[strategy.stopReason]) }}
      </div>
    </div>

    <div v-if="strategy.isActive" class="pt-4">
      <AppButton
        variant="danger"
        :is-loading="status.isLoading()"
        size="lg"
        class="w-full"
        @click="removeStrategy"
      >
        {{ $t('sgt.removeStrategy') }}
      </AppButton>
    </div>
  </div>
</template>
