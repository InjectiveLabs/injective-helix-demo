<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="w-full input-wrap" :class="classes">
    <div>
      <div class="flex items-center justify-between">
        <label
          v-if="!large"
          :for="$attrs.id"
          class="block text-xs font-semibold text-gray-200"
          v-html="$attrs.label || ''"
        >
          <span
            v-if="error && !errorBelow"
            class="text-red-400 italic font-semibold"
          >
            * {{ error }}
          </span>
        </label>
        <div v-if="$slots['context']" class="leading-none">
          <slot name="context" />
        </div>
      </div>
      <div class="relative" :class="{ 'mt-2': !dense }">
        <textarea
          v-if="multiLine"
          v-bind="$attrs"
          rows="6"
          :value="value"
          class="input textarea"
          @input="handleChangeOnInput"
        ></textarea>
        <input
          v-else
          v-bind="$attrs"
          class="input"
          :value="value"
          :class="{ 'input-large': large, 'input-round': round }"
          @blur="handleBlur"
          @input="handleChangeOnInput"
        />
        <div
          class="addon absolute inset-y-0 right-0 flex items-center"
          :class="{ 'pr-3': !large }"
        >
          <span v-if="showClose" @click="handleCloseEvent">
            <v-icon-close
              class="cursor-pointer h-4 w-4 text-gray-200 hover:text-primary-500"
            />
          </span>

          <span
            v-if="!isMaxValue && maxSelector"
            class="cursor-pointer"
            @click.stop="handleMaxSelector"
          >
            <span
              class="bg-gray-700 rounded uppercase tracking-1"
              :class="maxClasses"
            >
              {{ $t('max') }}
            </span>
          </span>
          <slot name="addon" />
        </div>
      </div>
      <span
        v-if="error && errorBelow"
        class="text-red-400 italic font-semibold absolute mt-1"
      >
        * {{ error }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { DOMEvent } from '~/types'

export default Vue.extend({
  inheritAttrs: false,

  props: {
    dense: {
      type: Boolean,
      default: false
    },

    large: {
      type: Boolean,
      default: false
    },

    round: {
      type: Boolean,
      default: false
    },

    errors: {
      type: Array as PropType<string[]>,
      default: () => []
    },

    maxSelector: {
      type: Boolean,
      default: false
    },

    showClose: {
      type: Boolean,
      default: false
    },

    showCheck: {
      type: Boolean,
      default: false
    },

    valid: {
      type: Boolean,
      default: false
    },

    value: {
      required: true,
      type: [Object, String, Number]
    },

    multiLine: {
      type: Boolean,
      default: false
    },

    errorBelow: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    maxClasses(): string[] {
      const { large } = this

      if (large) {
        return ['text-base', 'pr-2']
      }

      return ['px-2', 'py-1', 'mr-2', 'border', 'text-xs']
    },

    classes(): string | null {
      const { large } = this

      const classes = ['w-full ']

      if (large) {
        return 'flex-grow'
      }

      if (this.valid) {
        classes.push('is-valid')
      }

      if (!this.valid && this.errors.length > 0) {
        classes.push('is-invalid')
      }

      return classes.join(' ')
    },

    error(): string | null {
      if (this.errors.length > 0) {
        return this.errors[0]
      }

      return null
    },

    isMaxValue(): boolean {
      const { max } = this.$attrs
      const { value } = this

      return max === value
    }
  },

  methods: {
    handleChangeOnInput(event: DOMEvent<HTMLInputElement>) {
      this.$emit('input', event.target.value)
    },

    handleChangeFromString(value: string) {
      this.$emit('input', value)
    },

    handleCloseEvent() {
      this.$emit('close')
    },

    handleBlur() {
      this.$emit('blur')
    },

    handleMaxSelector() {
      const { maxSelector } = this
      const { max } = this.$attrs
      if (max || maxSelector) {
        if (max) {
          this.handleChangeFromString(max)
        }
        this.$emit('input-max')
      }
    }
  }
})
</script>
