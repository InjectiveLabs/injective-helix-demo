<template>
  <div :class="validationClass" class="relative">
    <div class="flex items-center justify-between">
      <label
        v-if="label || error"
        :for="`input-${uid}`"
        class="
          text-2xs
          mb-1
          leading-loose
          opacity-75
          flex
          items-center
          justify-between
        "
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="label" :class="error ? 'mr-2' : ''" v-html="label"></span>
        <span v-if="error" class="text-red-500 italic font-semibold">
          * {{ error }}
        </span>
      </label>
      <div v-if="$slots['context']">
        <slot name="context" />
      </div>
    </div>
    <div :class="{ 'has-addon': addon || $slots['addon'] }" class="relative">
      <input
        :id="`input-${uid}`"
        ref="input"
        v-bind="$attrs"
        class="input"
        :class="{
          'input-lg': lg,
          'text-lg': lg,
          'pr-12': maxSelector
        }"
        :value="value"
        @wheel="$event.target.blur()"
        @blur.stop="$emit('blur')"
        @focus="$event.target.select()"
        @input="handleChange"
      />

      <span v-if="addon" class="addon">
        <component :is="addon" />
      </span>

      <span
        v-if="maxSelector"
        class="addon-max cursor-pointer"
        @click.stop="handleMaxSelector"
      >
        <span
          class="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-xs"
        >
          {{ $t('max') }}
        </span>
      </span>

      <span
        v-if="minSelector"
        class="addon-min"
        @click.stop="handleMinSelector"
      >
        <span class="px-2 py-1 bg-dark-700 shadow-md text-gray-300 text-sm">
          {{ $t('min') }}
        </span>
      </span>

      <span v-if="!addon && $slots['addon']" class="addon">
        <slot name="addon"></slot>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { uniqueId } from '~/app/utils/generators'
import { DOMEvent } from '~/types'

export default Vue.extend({
  inheritAttrs: false,

  props: {
    errors: {
      required: false,
      type: Array as PropType<string[]>,
      default: () => []
    },

    addon: {
      required: false,
      type: String,
      default: ''
    },

    lg: {
      required: false,
      type: Boolean,
      default: false
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

    minSelector: {
      required: false,
      type: Boolean,
      default: false
    },

    valid: {
      required: false,
      type: Boolean,
      default: false
    },

    maxSelector: {
      required: false,
      type: Boolean,
      default: false
    },

    customHandler: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    uid(): string {
      return uniqueId()
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
    handleManualChange() {
      const value = (this.$refs.input as HTMLInputElement).value

      if (value !== this.value) {
        this.$emit('input', value)
      }
    },

    handleChange(event: DOMEvent<HTMLSelectElement>) {
      this.$emit('input', event.target.value)
    },

    handleKeyUp(event: DOMEvent<HTMLSelectElement>) {
      this.$emit('keyup', event.target.value)
    },

    handleChangeFromString(value: string) {
      this.$emit('input', value)
    },

    handleMaxSelector() {
      const { maxSelector } = this
      const { max } = this.$attrs

      if (max || maxSelector) {
        if (!this.customHandler && max) {
          this.handleChangeFromString(max)
        }

        this.$emit('input-max')
      }
    },

    handleMinSelector() {
      const { minSelector } = this
      const { min } = this.$attrs

      if (min || minSelector) {
        if (!this.customHandler && min) {
          this.handleChangeFromString(min)
        }

        this.$emit('input-min')
      }
    }
  }
})
</script>
