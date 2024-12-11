<script setup lang="ts">
import { GridStrategyTransformed } from '@/types'

const props = defineProps<{
  strategy: GridStrategyTransformed
}>()

const emit = defineEmits<{
  'strategy:select': [strategy: GridStrategyTransformed]
}>()

function selectStrategy() {
  emit('strategy:select', props.strategy)
}
</script>

<template>
  <div class="px-4 py-4">
    <div class="font-semibold">
      {{ $t('sgt.market') }}
    </div>
    <div class="flex items-center gap-2 mt-1">
      <UAvatar size="xs" :src="strategy.market.baseToken.logo" />
      <span>{{ strategy.market.ticker }}</span>
    </div>

    <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 6" :key="i">
        <div class="table-header-text">Upper Bounds</div>
        <div class="flex items-center gap-1 text-xs font-mono">
          <SharedAmountFormatter
            :amount="strategy.upperBound"
            :max-decimal-places="3"
            :decimal-places="2"
          />
          <span>{{ ' ' + strategy.market.quoteToken.symbol }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SharedButton size="xs" block variant="outline" @click="selectStrategy">
        Details
      </SharedButton>
      <PartialsLiquidityBotsSpotCommonRemoveStrategy
        :strategy="strategy.strategy"
      >
        <template #default="{ removeStrategy, status }">
          <SharedButton
            size="xs"
            :loading="status.isLoading()"
            block
            color="red"
            @click="removeStrategy"
          >
            Remove Strategy
          </SharedButton>
        </template>
      </PartialsLiquidityBotsSpotCommonRemoveStrategy>
    </div>
  </div>
</template>

<style scoped>
.table-header-text {
  @apply text-xs text-gray-400 mb-2;
}
</style>
