<script lang="ts" setup>
const { quoteSymbolsList } = useTradeReward()

const quoteDenoms = computed(() => quoteSymbolsList.value.join(', '))
</script>

<template>
  <PartialsCommonStatsItem class="col-span-2 lg:col-span-4">
    <template #value>
      <span v-if="quoteDenoms" class="font-mono text-lg">
        {{ quoteDenoms }}
      </span>
      <span v-else>&mdash;</span>
    </template>
    <template #title>
      <div class="flex items-center justify-center">
        {{ $t('trade.quote_denoms') }}
        <AppTooltip class="ml-2" :content="$t('trade.quote_denoms_tooltip')" />
      </div>
    </template>
  </PartialsCommonStatsItem>
</template>
