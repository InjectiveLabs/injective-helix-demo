<template>
  <div class="flex items-center w-full">
    <v-ui-button-select
      v-for="l in leverages"
      :key="`leverage-${l}`"
      :value="leverage"
      :option="l.toString()"
      primary
      class="flex-1 text-xs"
      @selected="handleOnSelect(l)"
    >
      {{ `${l}x` }}
    </v-ui-button-select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    leverage: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      leverages: [1, 2, 3, 5, 10, 20]
    }
  },

  methods: {
    handleOnSelect(leverage: number) {
      this.$emit('change', leverage.toString())
    }
  }
})
</script>
