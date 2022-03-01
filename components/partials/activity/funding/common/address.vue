<template>
  <div class="flex items-center">
    <span class="tracking-tight"><slot /></span>
    <div
      v-clipboard="() => address"
      v-clipboard:success="() => $toast.success($t('connect.addressCopied'))"
      class="cursor-pointer text-gray-500 pl-2 pt-1 hover:text-primary-500"
    >
      <v-icon-copy-plain class="w-4 h-4" />
    </div>
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
