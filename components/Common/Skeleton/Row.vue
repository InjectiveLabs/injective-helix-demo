<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    rows: number
    status?: Status
    columns: number
    height?: number
  }>(),
  {
    rows: 5,
    status: () => new Status(StatusType.Loading),
    height: undefined,
    columns: 5
  }
)
</script>

<template>
  <div
    v-for="row in rows"
    :key="row"
    :style="{ height: height ? height + 'px' : 'auto' }"
    class="flex p-2 text-xs"
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
