<template>
  <v-input
    v-bind="$attrs"
    ref="search-input"
    round
    :small="small"
    :value="search"
    @input="input"
  >
    <v-icon-search slot="addon" :class="[small ? 'w-4 h-4' : 'w-6 h-6']" />
  </v-input>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    search: {
      required: true,
      type: String
    },

    small: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    input(search: string) {
      this.$emit('searched', search)
    }
  }
})
</script>
