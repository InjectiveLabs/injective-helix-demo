<template>
  <div
    class="flex items-center text-sm cursor-pointer text-primary-500 hover:text-primary-600 whitespace-nowrap col-span-12 justify-center sm:col-span-1 sm:justify-start sm:h-[40px]"
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
