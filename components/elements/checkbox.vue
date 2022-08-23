<template>
  <div v-tooltip="{ content: tooltip }" class="flex items-center justify-start">
    <div class="checkbox-wrapper mr-2">
      <input
        :id="uid"
        :value="value"
        :checked="!!value"
        :disabled="disabled"
        class="checkbox"
        type="checkbox"
        @change="handleChange"
      />
      <label
        :for="uid"
        :data-cy="dataCy"
        class="top-0 left-0 flex items-center justify-center absolute"
        :class="{ 'cursor-pointer': !disabled }"
      >
        <IconCheck class="w-2 h-2 text-gray-950 checkmark" />
        <IconMinus class="w-2 h-2 text-helixGray-400 minus" />
      </label>
    </div>
    <label
      :for="uid"
      class="select-none text-xs"
      :class="{
        'text-gray-500': disabled,
        'text-white cursor-pointer': !disabled
      }"
    >
      <slot />
    </label>
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
    tooltip: {
      required: false,
      default: '',
      type: String
    },

    value: {
      type: [Boolean, String],
      required: true
    },

    disabled: {
      type: Boolean,
      default: false
    },

    dataCy: {
      type: String,
      default: 'unknown-id'
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
.checkbox-wrapper {
  --checkbox-width: 16px;
  --checkbox-height: 16px;
  position: relative;
  width: var(--checkbox-width);
  height: var(--checkbox-height);

  input[type='checkbox'] {
    visibility: hidden;
    width: var(--checkbox-width);
    height: var(--checkbox-height);
  }

  input[type='checkbox'] + label {
    width: var(--checkbox-width);
    height: var(--checkbox-height);
    border: 1px solid white;
    background-color: transparent;

    .checkmark,
    .minus {
      display: none;
    }
  }

  input[type='checkbox']:checked + label {
    background-color: #fff;

    .checkmark {
      display: block;
    }
  }

  input[type='checkbox']:disabled + label {
    border-color: #727376;
    background-color: transparent;

    .checkmark {
      display: none;
    }

    .minus {
      display: block;
    }
  }
}
</style>
