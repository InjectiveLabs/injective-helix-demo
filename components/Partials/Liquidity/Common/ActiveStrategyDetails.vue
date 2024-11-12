<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'
const props = withDefaults(
  defineProps<{
    activeStrategy: TradingStrategy
  }>(),
  {}
)

const strategies = useSpotGridStrategies(computed(() => [props.activeStrategy]))

const strategy = computed(() => strategies.value[0])

const isPositivePnl = computed(() =>
  new BigNumberInBase(strategy.value.pnl).gte(0)
)

const percentagePnl = computed(() =>
  new BigNumberInBase(strategy.value.pnl).toFormat(2)
)
</script>

<template>
  <div class="text-sm space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-lg font-bold">Grid Details</p>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="strategy.isActive ? 'bg-green-500' : 'bg-red-500'"
        />
        <p>{{ strategy.isActive ? 'Running' : 'Removed' }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">{{ $t('liquidityBots.totalProfit') }}</p>

      <div
        v-if="new BigNumberInBase(strategy.pnl).isZero()"
        class="text-coolGray-400"
      >
        &mdash;
      </div>
      <div
        v-else
        class="font-bold"
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

      <div>
        <SharedAmountFormatter
          :max-decimal-places="3"
          :amount="strategy.currentUsdValue.toFixed()"
          :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
        />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-coolGray-400">
        {{ $t('liquidityBots.currentBalance') }}
      </p>

      <div>
        <PartialsLiquidityCommonDetailsPair
          v-bind="{ market: strategy.market }"
        >
          <template #base>
            <SharedAmountFormatter
              :amount="strategy.currentBaseBalanceAmount"
              :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
              :max-decimal-places="3"
            />
          </template>
          <template #quote>
            <SharedAmountFormatter
              :amount="strategy.currentQuoteBalanceAmount"
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
          <template #base>{{ strategy.initialBaseBalanceAmount }}</template>
          <template #quote>{{ strategy.initialQuoteBalanceAmount }}</template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-400">{{ $t('sgt.initialEntryPrice') }}</p>
      <div class="text-right">
        <SharedAmountFormatter
          :amount="strategy.executionPrice"
          :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
          :max-decimal-places="3"
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

    <div v-if="strategy.isActive" class="pt-4">
      <UButton block color="red">
        {{ $t('sgt.removeStrategy') }}
      </UButton>
    </div>
  </div>
</template>
