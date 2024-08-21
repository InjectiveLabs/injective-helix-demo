<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    status?: Status
    columns: number
    rows: number
    height?: number
  }>(),
  {
    status: () => new Status(StatusType.Loading),
    columns: 5,
    rows: 5,
    height: undefined
  }
)
</script>

<template>
  <div
    v-for="row in rows"
    :key="row"
    :style="{ height: height ? height + 'px' : 'auto' }"
    class="flex p-2 text-xs font-mono"
  >
    <div
      v-for="column in columns"
      :key="column"
      class="flex-1 flex items-center space-x-2 p-2 font-sans"
    >
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>
  </div>
</template>
