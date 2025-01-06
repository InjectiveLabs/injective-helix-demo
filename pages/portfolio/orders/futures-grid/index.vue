<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div>
    <h1>{{ $t('sgt.tabs.liveFuturesGrid') }}</h1>

    <pre>
        {{ gridStrategyStore.activeStrategies }}
    </pre>
  </div>
</template>
