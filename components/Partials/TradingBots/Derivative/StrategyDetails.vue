<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  STOP_REASON_MAP,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { StrategyStatus } from '@/types'

const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    activeStrategy: TradingStrategy
  }>(),
  {}
)

const { formattedStrategies: strategies } = useDerivativeGridStrategies(
  computed(() => props.activeStrategy),
  subaccountPortfolioBalanceMap
)

const strategy = computed(() => strategies.value[0])

const isPositivePnl = computed(() =>
  new BigNumberInBase(strategy.value.pnl).gt(0)
)

const isZeroPnl = computed(() =>
  new BigNumberInBase(strategy.value.pnl).isZero()
)

const percentagePnl = computed(() =>
  new BigNumberInBase(strategy.value.percentagePnl).toFormat(2)
)
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
        <p>{{ $t(`sgt.${strategy.strategyStatus}`) }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">{{ $t('liquidityBots.totalProfit') }}</p>

      <div
        class="font-bold"
        :class="{
          'text-green-500': isPositivePnl,
          'text-red-500': !isPositivePnl && !isZeroPnl,
          'text-coolGray-500': isZeroPnl
        }"
      >
        <span
          v-if="strategy.strategyStatus === StrategyStatus.Pending"
          class="text-coolGray-400"
        >
          &mdash;
        </span>

        <template v-else>
          <span>{{ isPositivePnl ? '+' : '' }}</span>
          <SharedAmountFormatter
            :max-decimal-places="3"
            :amount="strategy.pnl"
            :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
          />
          <span>
            {{ ' ' + strategy.market.quoteToken.symbol }} / ({{
              percentagePnl
            }}%)
          </span>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('liquidityBots.totalAmount') }}
      </p>

      <div v-if="strategy.strategyStatus === StrategyStatus.Pending">
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
        <span v-if="strategy.strategyStatus === StrategyStatus.Pending">
          &mdash;
        </span>
        <span v-else>
          <SharedAmountFormatter
            :amount="strategy.finalQuoteBalanceQuantity"
            :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
            :max-decimal-places="3"
          />
          {{ strategy.market.quoteToken.symbol }}
        </span>
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
        {{ strategy.initialQuoteBalanceQuantity }}
        {{ strategy.market.quoteToken.symbol }}
      </div>
    </div>

    <!-- TODO: Uncomment When we have the data from indexer -->
    <!-- <div class="flex justify-between mb-2 text-sm">
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
    </div> -->

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.numberOfGrids') }}</p>
      <div class="text-right">
        {{ strategy.numberOfGridLevels }}
      </div>
    </div>

    <!-- TODO: Uncomment When we have the data from indexer -->

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.takeProfit') }}</span>
      </span>

      <div>
        <span v-if="!strategy.takeProfit">{{ $t('sgt.disabled') }}</span>
        <span v-else>
          {{ strategy.takeProfit.exitPrice }}
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
          {{ strategy.stopLoss.exitPrice }}
        </span>
      </div>
    </div>

    <!-- <div
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
    </div> -->

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

    <div v-if="strategy.strategyStatus !== StrategyStatus.Removed" class="pt-4">
      <PartialsLiquidityBotsSpotCommonRemoveStrategy
        v-slot="{ removeStrategy, status }"
        v-bind="{
          strategy: strategy.strategy,
          pnl: strategy.pnl,
          pnlPercentage: strategy.percentagePnl
        }"
      >
        <AppButton
          variant="danger"
          :is-loading="
            status.isLoading() ||
            strategy.strategyStatus === StrategyStatus.Pending
          "
          :disabled="
            status.isLoading() ||
            strategy.strategyStatus === StrategyStatus.Pending
          "
          size="lg"
          class="w-full"
          @click="removeStrategy"
        >
          {{ $t('sgt.removeStrategy') }}
        </AppButton>
      </PartialsLiquidityBotsSpotCommonRemoveStrategy>
    </div>
  </div>
</template>
