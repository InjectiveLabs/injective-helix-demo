<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()
</script>

<template>
  <div>
    <h1>{{ t('sgt.tabs.liveFuturesGrid') }}</h1>

    <pre>
        {{ gridStrategyStore.activeStrategies }}
    </pre>
  </div>
</template>
