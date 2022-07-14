<template>
  <div class="bg-gray-900 p-3 rounded-lg flex items-center">
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

<script lang="ts">
import Vue, { PropType } from 'vue'
import { NetworkMeta } from '@injectivelabs/sdk-ui-ts'

export default Vue.extend({
  props: {
    hideIcon: {
      type: Boolean,
      default: false
    },

    networkMeta: {
      type: Object as PropType<NetworkMeta>,
      required: true
    }
  }
})
</script>
