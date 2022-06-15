<template>
  <VInput
    v-bind="$attrs"
    ref="search-input"
    round
    :value="search"
    @input="input"
  >
    <IconSearch slot="addon" class="w-6 h-6" />
  </VInput>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    search: {
      required: true,
      type: String
    }
  },

  methods: {
    input(search: string) {
      this.$emit('searched', search)
    }
  }
})
</script>
