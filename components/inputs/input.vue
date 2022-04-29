<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="w-full input-wrap" :class="classes">
    <div>
      <div class="flex items-center justify-between">
        <label
          v-if="!lg && !xl"
          :for="$attrs.id"
          class="block text-xs font-semibold text-gray-200"
          v-html="$attrs.label || ''"
        >
        </label>
        <span
          v-if="error && !errorBelow"
          class="text-red-400 italic font-semibold text-2xs"
        >
          * {{ error }}
        </span>
        <div v-if="$slots['context']" class="leading-none">
          <slot name="context" />
        </div>
      </div>
      <div
        class="relative"
        :class="[
          wrapperClasses,
          { 'mt-2': !dense, 'input-wrapper': !lg && !xl && !transparentBg }
        ]"
      >
        <textarea
          v-if="multiLine"
          v-bind="$attrs"
          rows="6"
          :value="value"
          class="input textarea"
          @input="handleChangeOnInput"
        />
        <div v-else class="flex justify-between no-shadow">
          <input
            v-bind="$attrs"
            class="input"
            autocomplete="off"
            :value="value"
            :class="{
              'input-lg': lg,
              'input-xl': xl,
              'input-round': round,
              'input-small': small,
              'input-bg-transparent': transparentBg
            }"
            @blur="handleBlur"
            @input="handleChangeOnInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            @wheel="$event.target.blur()"
          />
          <div
            class="addon flex items-center flex-shrink-0"
            :class="{ 'pr-3': !lg && !xl }"
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
                {{ $t('trade.max') }}
              </span>
            </span>
            <slot name="addon" />
          </div>
        </div>
      </div>
      <span
        v-if="error && errorBelow"
        class="text-red-400 absolute"
        :class="[
          errorClasses,
          {
            'text-xs mt-2': lg,
            'text-sm mt-2': xl,
            'text-2xs mt-1 font-semibold': !xl && !lg
          }
        ]"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { DOMEvent } from '~/types'
import {
  convertToNumericValue,
  passNumericInputValidation
} from '~/app/utils/input'

export default Vue.extend({
  inheritAttrs: false,

  props: {
    dense: {
      type: Boolean,
      default: false
    },

    lg: {
      type: Boolean,
      default: false
    },

    xl: {
      type: Boolean,
      default: false
    },

    small: {
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

    maxDecimals: {
      type: Number,
      default: 6
    },

    multiLine: {
      type: Boolean,
      default: false
    },

    errorBelow: {
      type: Boolean,
      default: false
    },

    errorClasses: {
      type: String,
      default: ''
    },

    wrapperClasses: {
      type: String,
      default: ''
    },

    transparentBg: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    maxClasses(): string[] {
      const { lg } = this

      if (lg) {
        return ['text-base', 'mr-2', 'p-0.5']
      }

      return ['px-2', 'py-1', 'mr-2', 'border', 'text-xs']
    },

    classes(): string | null {
      const { xl } = this

      const classes = ['w-full']

      if (xl) {
        classes.push('flex-grow')
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
    handlePaste(event: DOMEvent<HTMLInputElement>) {
      if (event.target.type === 'number') {
        event.preventDefault()
      }
    },

    handleChangeOnInput(event: DOMEvent<HTMLInputElement>) {
      const { maxDecimals } = this
      const {
        data: eventKey,
        inputType,
        target: { value, type }
      } = event

      if (type !== 'number') {
        this.$emit('input', value)
      } else {
        const formattedValue = convertToNumericValue(
          value,
          maxDecimals
        ).toString()

        this.$emit('input', formattedValue)

        if (
          eventKey !== ',' &&
          eventKey !== '.' &&
          inputType !== 'deleteContentBackward'
        ) {
          event.target.value = formattedValue
        }
      }
    },

    handleKeydown(event: DOMEvent<HTMLInputElement>) {
      if (
        event.target.type === 'number' &&
        !passNumericInputValidation(event, this.maxDecimals === 0 ? ['.'] : [])
      ) {
        event.preventDefault()
      } else {
        this.$emit('keydown', event)
      }
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
