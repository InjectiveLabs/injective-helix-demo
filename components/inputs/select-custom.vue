<template>
  <div :class="validationClass" class="relative">
    <div class="flex mb-2 items-center">
      <label
        v-if="label || error"
        :for="`input-select-${uid}`"
        class="block text-xs font-semibold text-gray-200"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="label" :class="error ? 'mr-2' : ''" v-html="label"></span>
        <span v-if="error" class="text-red-500 italic font-semibold">
          * {{ error }}
        </span>
      </label>
      <div v-if="$slots['context']" class="ml-1 leading-none">
        <slot name="context" />
      </div>
    </div>
    <div class="mt-1 relative">
      <v-select
        :id="`input-select-${uid}`"
        v-bind="$attrs"
        :class="{ 'is-empty': !value }"
        :options="options"
        :value="value"
        :reduce="(option) => option.code"
        class="input-select"
        @input="handleChange"
      >
        <template v-if="customOptionSlot" #option="option">
          <div
            class="flex items-end"
            :class="option.disabled ? 'pointer-events-none opacity-50' : ''"
          >
            {{ option.label }}
            <span class="text-2xs ml-2 opacity-30">{{ option.badge }}</span>
          </div>
        </template>
      </v-select>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import vSelect from 'vue-select'

export default Vue.extend({
  components: {
    vSelect
  },

  inheritAttrs: false,

  props: {
    errors: {
      required: false,
      type: Array as PropType<string[]>,
      default: () => []
    },

    customOptionSlot: {
      required: false,
      type: Boolean,
      default: false
    },

    addon: {
      required: false,
      type: String,
      default: ''
    },

    options: {
      required: true,
      type: Array as PropType<{ code: string; label: string }[]>
    },

    value: {
      required: true,
      type: [Object, String, Number],
      default: ''
    },

    label: {
      required: false,
      type: String,
      default: ''
    },

    valid: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isDropdownOpen: false
    }
  },

  computed: {
    uid(): string {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
    },

    validationClass(): { 'is-invalid': boolean; 'is-valid': boolean } | null {
      if (this.valid) {
        return {
          'is-invalid': false,
          'is-valid': true
        }
      }
      if (!this.valid && this.errors.length > 0) {
        return {
          'is-invalid': true,
          'is-valid': false
        }
      }
      return null
    },

    error(): string | null {
      if (this.errors.length > 0) {
        return this.errors[0]
      }

      return null
    }
  },

  methods: {
    handleChange(value: string) {
      this.$emit('input', value || '')
    },

    handleDropdownButtonClick() {
      this.isDropdownOpen = !this.isDropdownOpen
    }
  }
})
</script>
