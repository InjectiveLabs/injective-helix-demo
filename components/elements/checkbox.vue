<template>
  <div class="text-xs">
    <input
      :id="uid"
      :value="value"
      :checked="!!value"
      :disabled="disabled"
      class="checkbox"
      type="checkbox"
      @change="handleChange"
    />
    <label :for="uid" :data-cy="dataCy" class="flex"><slot /></label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'input'
  },

  props: {
    value: {
      type: [Boolean, String],
      required: true
    },

    dataCy: {
      type: String,
      default: 'unknown-id'
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      checked: false
    }
  },

  computed: {
    uid(): string {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
    }
  },

  mounted() {
    if (this.value === true) {
      this.checked = true
    }
  },

  methods: {
    handleChange() {
      this.checked = !this.checked
      this.$emit('input', this.checked)
    }
  }
})
</script>

<style lang="scss" scoped>
.checkbox {
  @apply absolute opacity-0;

  + label {
    @apply relative cursor-pointer p-0 select-none;

    &::before {
      content: '';

      @apply mr-2 inline-block align-top w-4 h-4 bg-transparent border border-gray-200;
    }
  }

  // Disabled state label.
  &:disabled + label {
    @apply text-gray-400;
  }

  // Disabled box.
  &:disabled + label::before {
    @apply shadow-none bg-gray-600 border-transparent bg-opacity-50;
  }

  // Checkmark
  &:checked + label::after {
    content: '';

    @apply absolute left-0 top-0;

    width: 5px;
    height: 10px;
    border: 2px solid theme('colors.gray.200');
    border-top-style: none;
    border-left-style: none;
    transform: translate(6px, 1.5px) rotate(45deg);
  }
}
</style>
