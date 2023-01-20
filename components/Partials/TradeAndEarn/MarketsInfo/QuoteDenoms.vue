<script lang="ts" setup>
const { campaignInfo } = useTradeReward()

const quoteDenoms = computed(() => {
  if (!campaignInfo.value) {
    return ''
  }

  return campaignInfo.value.quoteSymbolsList.join(', ')
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
        <AppInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.quote_denoms_tooltip')"
        />
      </div>
    </template>
  </PartialsCommonStatsItem>
</template>
