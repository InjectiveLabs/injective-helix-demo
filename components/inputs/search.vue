<template>
  <v-input
    v-bind="$attrs"
    ref="search-input"
    round
    :show-close="showClearIcon"
    :small="small"
    :value="search"
    @input="input"
    @close="clear"
  >
    <v-icon-search
      slot="addon"
      class="ml-1"
      :class="[small ? 'w-4 h-4' : 'w-5 h-5']"
    />
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

  computed: {
    showClearIcon(): boolean {
      const { search } = this

      return search.trim().length > 0
    }
  },

  methods: {
    clear() {
      this.$emit('searched', '')
    },

    input(search: string) {
      this.$emit('searched', search)
    }
  }
})
</script>
