<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  },

  size: {
    type: Number,
    default: 22
  },

  length: {
    type: Number,
    default: 5
  }
})
</script>

<template>
  <div
    v-if="status.isLoading()"
    :style="{ height: size + 'px' }"
    class="flex p-1 bg-brand-850 space-x-1 rounded-md"
  >
    <div
      v-for="i in length"
      :key="i"
      class="w-2 bg-transparent rounded-sm animate-pulse [animation-duration:1s]"
      :style="{ animationDelay: `${i * 0.1}s` }"
    />
  </div>

  <slot v-else />
</template>
