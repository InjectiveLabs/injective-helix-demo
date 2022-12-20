<template>
  <Select
    class="select"
    :options="options"
    label="label"
    :value="selectedOption"
    :clearable="false"
    :searchable="false"
    @input="handleInput"
  >
    <template #open-indicator="{ attributes }">
      <div v-bind="attributes">
        <IconCaretDown class="w-4 h-4 text-gray-500" />
      </div>
    </template>

    <template #selected-option="{ label }">
      <slot name="selected" :label="label" />
    </template>

    <template #option="option">
      <slot name="option" :option="option" />
    </template>
  </Select>
</template>

<script lang="ts">
import Vue from 'vue'
import Select from 'vue-select'
import { SelectOption } from '~/types'

export default Vue.extend({
  name: 'CustomSelect',

  components: {
    Select
  },

  props: {
    selectClass: {
      type: String,
      default: ''
    },

    value: {
      type: [String, Number],
      default: null
    },

    options: {
      type: Array,
      required: true
    }
  },

  computed: {
    selectedOption(): SelectOption {
      const { value: currentValue, options } = this

      const result = options.find((option) => {
        const { value } = option as SelectOption

        return currentValue === value
      }) as SelectOption

      return result
    }
  },

  methods: {
    handleInput(value: SelectOption) {
      this.$emit('change', value)
    }
  }
})
</script>
