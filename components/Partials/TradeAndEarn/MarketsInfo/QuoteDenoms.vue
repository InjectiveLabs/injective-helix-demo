<script lang="ts" setup>
const quoteDenoms = computed(() => {
  return useTradeReward().quoteSymbolsList.value.join(', ')
})
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
        <CommonInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.quote_denoms_tooltip')"
        />
      </div>
    </template>
  </PartialsCommonStatsItem>
</template>
