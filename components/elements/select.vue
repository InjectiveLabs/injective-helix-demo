<template>
<div>
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
      <span
        class="text-sm font-semibold cursor-pointer"
        :class="{
          'text-gray-500': !hasSelectedOption,
          'text-primary-500': hasSelectedOption
        }"
      >
        {{ label }}
      </span>
    </template>

    <template #option="option">
      {{ option.label }}
    </template>
  </Select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Select from 'vue-select'

interface SelectOption {
  label: string
  value: any
}

export default Vue.extend({
  name: 'CustomSelect',

  components: {
    Select
  },

  props: {
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
    hasSelectedOption(): boolean {
      const { value: currentValue, options } = this

      return !!options.find(option => {
        const { value } = option as SelectOption
        return currentValue === value
      })
    },

    selectedOption(): SelectOption {
      const { value: currentValue, options } = this

      return options.find(option => {
        const { value } = option as SelectOption

        return currentValue === value
      }) as SelectOption
    }
  },

  methods: {
    handleInput(value: SelectOption) {
      this.$emit('change', value)
    }
  }
})
</script>
