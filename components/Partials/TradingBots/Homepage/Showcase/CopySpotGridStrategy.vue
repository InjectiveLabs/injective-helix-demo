<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GridStrategyTransformed, LiquidityBotField } from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: GridStrategyTransformed
  }>(),
  {}
)

const strategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const { values, validate } = useForm<{
  baseAmount: LiquidityBotField.BaseAmount
  quoteAmount: LiquidityBotField.QuoteAmount
}>()

const status = reactive(new Status(StatusType.Idle))

async function copyStrategy() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  strategyStore
    .copySpotGridTradingStrategy({
      strategy: props.strategy.strategy,
      baseAmount: values[LiquidityBotField.BaseAmount],
      quoteAmount: values[LiquidityBotField.QuoteAmount]
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="text-sm space-y-2">
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
      <p class="text-coolGray-400">{{ $t('sgt.numberOfGrids') }}</p>
      <div class="text-right">
        {{ strategy.numberOfGridLevels }}
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

    <PartialsLiquidityBotsSpotFormDeposit
      v-bind="{ market: strategy.market }"
      is-single-column
      class="mt-4"
    />

    <div class="mt-4">
      <SharedButton block :loading="status.isLoading()" @click="copyStrategy">
        {{ $t('sgt.create') }}
      </SharedButton>
    </div>
  </div>
</template>
