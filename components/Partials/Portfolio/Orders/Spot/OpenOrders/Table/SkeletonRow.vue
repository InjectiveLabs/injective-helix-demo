<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Loading)
  }
})
</script>

<template>
  <div class="flex p-2 text-xs font-mono">
    <div class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>

    <div class="flex-1 flex items-center p-2">
      <span>
        <CommonSkeletonNumber v-bind="{ status }" />
      </span>
    </div>

    <div class="flex-1 flex items-center p-2">
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>

    <div class="flex-1 flex items-center p-2">
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>

    <div class="flex-1 flex items-center p-2">
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>

    <div class="flex-1 flex items-center p-2">
      <CommonSkeletonNumber v-bind="{ status }" />
    </div>

    <div class="flex-1 flex items-center p-2">
      <div class="space-y-1">
        <CommonSkeletonNumber v-bind="{ status }" />
      </div>
    </div>
  </div>
</template>
