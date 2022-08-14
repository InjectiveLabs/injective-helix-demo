<template>
  <div
    class="flex items-center h-[40px] text-sm cursor-pointer text-primary-500 hover:text-primary-600"
    @click="handleClear"
  >
    {{ $t('filters.clearAll') }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  methods: {
    handleClear() {
      this.$emit('clear')
    }
  }
})
</script>
