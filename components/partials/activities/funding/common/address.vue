<template>
  <div
    v-clipboard="() => address"
    v-clipboard:success="() => $toast.success($t('connect.addressCopied'))"
    class="flex items-center cursor-pointer"
  >
    <span class="underline tracking-tight"><slot /></span>
    <v-icon-copy-plain class="text-gray-500 w-4 h-4 ml-2 mt-1" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    address: {
      type: String,
      required: true
    }
  }
})
</script>
