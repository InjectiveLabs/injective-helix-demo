<script lang="ts" setup>
import { PropType } from 'vue'
import { NetworkMeta } from '@injectivelabs/sdk-ui-ts'

defineProps({
  hideIcon: Boolean,

  networkMeta: {
    type: Object as PropType<NetworkMeta>,
    required: true
  }
})
</script>

<template>
  <div class="bg-gray-900 p-4 rounded flex items-center">
    <img
      v-if="!hideIcon"
      :src="networkMeta.icon"
      :alt="networkMeta.text"
      class="h-4 w-4 rounded-full mr-2"
    />
    <span class="text-gray-200 text-sm">
      {{ networkMeta.text }}
    </span>
  </div>
</template>
