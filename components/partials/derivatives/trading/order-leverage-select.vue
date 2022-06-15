<template>
  <div class="flex items-center w-full">
    <VButtonSelect
      v-for="l in leverages"
      :key="`leverage-${l}`"
      :value="leverage"
      :option="l.toString()"
      primary
      xs
      class="flex-1 text-xs"
      @selected="handleOnSelect(l)"
    >
      {{ `${l}x` }}
    </VButtonSelect>
  </div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js'
import Vue from 'vue'
export default Vue.extend({
  props: {
    leverage: {
      type: String,
      required: true
    },

    maxLeverage: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      leverageSteps: [1, 2, 3, 5, 10, 20, 50, 100]
    }
  },

  computed: {
    leverages(): number[] {
      const { leverageSteps, maxLeverage } = this

      return leverageSteps.filter((l) => {
        return new BigNumber(l).lte(maxLeverage)
      })
    }
  },

  methods: {
    handleOnSelect(leverage: number) {
      this.$emit('change', leverage.toString())
    }
  }
})
</script>
