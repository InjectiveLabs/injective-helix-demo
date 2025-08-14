<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { STOP_REASON_MAP } from '@/app/utils/constants'
import { StrategyStatus } from '@/types'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'

const jsonStore = useSharedJsonStore()
const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    activeStrategy: TradingStrategy
  }>(),
  {}
)

const { status: lastTradedPriceStatus, formattedStrategies: strategies } =
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

// const subaccountHasFunds = computed(() => {
//   const subaccountBalance =
//     subaccountPortfolioBalanceMap.value[strategy.value.subaccountId]

//   const totalInUsd = subaccountBalance.reduce((acc, balance) => {
//     return acc.plus(balance.totalBalanceInUsd)
//   }, new BigNumberInBase(0))

//   return totalInUsd.gt(1)
// })
</script>

<template>
  <div v-if="strategy" class="text-sm space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-lg font-bold">
        {{ $t('tradingBots.gridDetails') }}
      </p>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="strategy.isActive ? 'bg-green-500' : 'bg-red-500'"
        />
        <p>{{ $t(`tradingBots.${strategy.strategyStatus}`) }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.totalProfit') }}
      </p>

      <div
        v-if="
          new BigNumberInBase(strategy.percentagePnl).lte(-99) ||
          new BigNumberInBase(strategy.pnl).isZero() ||
          lastTradedPriceStatus.isLoading() ||
          strategy.strategyStatus === StrategyStatus.Pending
        "
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div
        v-else
        class="font-bold flex"
        :class="{
          'text-green-500': isPositivePnl,
          'text-red-500': !isPositivePnl && !strategy.isZeroPnl,
          'text-coolGray-400': strategy.isZeroPnl
        }"
      >
        <SharedAmount
          v-bind="{
            useSubscript: true,
            amount: strategy.pnl,
            shouldAbbreviate: false
          }"
        >
          <template #prefix>
            <span>{{ isPositivePnl ? '+' : '' }}</span>
          </template>
        </SharedAmount>
        <span>
          {{ ' ' + strategy.market.quoteToken.symbol }} / ({{ percentagePnl }}%)
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.totalAmount') }}
      </p>

      <div
        v-if="
          new BigNumberInBase(strategy.percentagePnl).lte(-99) ||
          lastTradedPriceStatus.isLoading() ||
          strategy.strategyStatus === StrategyStatus.Pending
        "
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div v-else>
        <SharedAmountUsd
          v-bind="{
            shouldAbbreviate: false,
            amount: strategy.totalAmount.toFixed()
          }"
        >
          <template #prefix>$ </template>
        </SharedAmountUsd>
        USD
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        <span v-if="strategy.isActive">
          {{ $t('tradingBots.liquidityBots.currentBalance') }}
        </span>
        <span v-else>{{ $t('tradingBots.liquidityBots.finalBalance') }}</span>
      </p>

      <div
        v-if="
          new BigNumberInBase(strategy.percentagePnl).lte(-99) ||
          lastTradedPriceStatus.isLoading() ||
          strategy.strategyStatus === StrategyStatus.Pending
        "
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div v-else>
        <PartialsLiquidityCommonDetailsPair
          v-bind="{ market: strategy.market }"
        >
          <template #base>
            <SharedAmount :amount="strategy.finalBaseBalanceQuantity" />
          </template>
          <template #quote>
            <SharedAmount :amount="strategy.finalQuoteBalanceQuantity" />
          </template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="border-t border-coolGray-800 !my-4" />

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.liquidityBots.timeCreated') }}
      </p>

      <div>
        {{ strategy.createdAtFormatted }}
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.liquidityBots.duration') }}
      </p>

      <div>
        {{ strategy.durationFormatted }}
      </div>
    </div>

    <div class="border-t border-coolGray-800 !my-4" />

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('tradingBots.priceRange') }}</p>
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
      <p class="text-coolGray-400">{{ $t('tradingBots.initialAmount') }}</p>
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
      <p class="text-coolGray-400">{{ $t('tradingBots.initialEntryPrice') }}</p>
      <div class="text-right">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: strategy.executionPrice
          }"
        />
        <span class="text-coolGray-400 text-xs">
          {{ ' ' + strategy.market.quoteToken.symbol }}
        </span>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('tradingBots.numberOfGrids') }}</p>
      <div class="text-right">
        {{ strategy.numberOfGridLevels }}
      </div>
    </div>

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('trade.takeProfit') }}</span>
      </span>

      <div>
        <span v-if="!strategy.takeProfit">{{ $t('common.disabled') }}</span>
        <span v-else class="capitalize">
          {{ strategy.takeProfit.exitPrice }} /
          {{ strategy.takeProfit.exitType }}
        </span>
      </div>
    </div>

    <div class="flex justify-between mb-4 text-sm">
      <span class="text-coolGray-400 flex items-center space-x-2">
        <span>{{ $t('trade.stopLoss') }}</span>
      </span>

      <div>
        <span v-if="!strategy.stopLoss">{{ $t('common.disabled') }}</span>
        <span v-else class="capitalize">
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
        {{ $t('tradingBots.liquidityBots.trailingUpper') }}
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
        {{ $t('tradingBots.liquidityBots.trailingLower') }}
      </p>
      <div class="text-right">
        {{ strategy.trailingLower }}
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.gridMode') }}
      </p>
      <div class="text-right">
        {{ $t(`tradingBots.sgt.modes.${strategy.strategyType}`) }}
      </div>
    </div>

    <div v-if="strategy.stopReason" class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">
        {{ $t('tradingBots.stopReason') }}
      </p>
      <div class="text-right">
        {{ $t(STOP_REASON_MAP[strategy.stopReason]) }}
      </div>
    </div>

    <div v-if="strategy.strategyStatus !== StrategyStatus.Removed" class="pt-4">
      <AppButton v-if="jsonStore.isPostUpgradeMode" disabled class="w-full">
        {{ $t('trade.postOnlyWarning') }}
      </AppButton>

      <PartialsLiquidityBotsSpotCommonRemoveStrategy
        v-else
        v-slot="{ removeStrategy, status: removeStatus }"
        v-bind="{
          strategy: strategy.strategy,
          pnl: strategy.pnl,
          pnlPercentage: strategy.percentagePnl
        }"
      >
        <AppButton
          variant="danger"
          :is-loading="
            removeStatus.isLoading() ||
            strategy.strategyStatus === StrategyStatus.Pending
          "
          size="lg"
          class="w-full"
          @click="removeStrategy"
        >
          {{ $t('tradingBots.removeStrategy') }}
        </AppButton>
      </PartialsLiquidityBotsSpotCommonRemoveStrategy>
    </div>
  </div>
</template>
