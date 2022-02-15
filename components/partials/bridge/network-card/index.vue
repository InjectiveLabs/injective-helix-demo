<template>
  <div class="bg-gray-900 p-3 rounded-lg flex items-center">
    <img
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
import { NetworkMeta } from '@injectivelabs/ui-common'

export default Vue.extend({
  props: {
    networkMeta: {
      type: Object as PropType<NetworkMeta>,
      required: true
    }
  }
})
</script>
