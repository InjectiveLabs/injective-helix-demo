<script setup lang="ts">
const gridStore = useGridStore()

async function handleFetchStrategies() {
  await gridStore.fetchStrategies()
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4">
      <button class="uppercase text-xs font-semibold">All Strategies</button>
      <button class="uppercase text-xs font-semibold">All Strategies</button>
    </div>
    <CommonCardTableWrap class="flex-1">
      <CommonCard class="h-full flex-auto">
        <button @click="handleFetchStrategies">Fetch Strategies</button>
      </CommonCard>
    </CommonCardTableWrap>
  </div>
</template>
