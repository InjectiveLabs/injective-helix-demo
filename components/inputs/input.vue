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
          v-if="error && !errorBelow && !hideErrors"
          class="text-red-400 italic font-semibold text-2xs"
          data-cy="reusable-input-error"
        >
          * {{ error }}
        </span>
        <div v-if="$slots['context']" class="leading-none">
          <slot name="context" />
        </div>
      </div>
      <div class="relative" :class="wrapperClass">
        <textarea
          v-if="multiLine"
          v-bind="$attrs"
          rows="6"
          :value="value"
          class="input textarea"
          @input="handleChangeOnInput"
        />
        <div v-else class="flex justify-between no-shadow">
          <div
            v-if="prefix"
            class="flex items-center text-xl font-semibold pl-4 pr-1"
            v-html="prefix"
          />
          <div
            v-if="showPrefix"
            class="prefix flex items-center flex-shrink-0"
            :class="{ 'pl-3': !lg && !xl }"
          >
            <slot name="prefix" />
          </div>
          <input
            v-bind="$attrs"
            class="input"
            autocomplete="off"
            :value="value"
            :class="inputClass"
            @blur="handleBlur"
            @input="handleChangeOnInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            @wheel="$event.target.blur()"
          />
          <div
            v-if="addonVisible"
            class="addon flex items-center flex-shrink-0"
            :class="{ 'pr-3': !lg && !xl && !disableAddonPadding }"
          >
            <span
              v-if="showClose"
              data-cy="reusable-input-clear-button"
              @click="handleCloseEvent"
            >
              <IconClose
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
                :class="maxButtonClasses"
                data-cy="reusable-max-button"
              >
                {{ $t('trade.max') }}
              </span>
            </span>
            <slot name="addon" />
          </div>
        </div>
      </div>
      <span
        v-if="error && errorBelow && !hideErrors"
        class="text-red-400 absolute"
        data-cy="reusable-input-bellow-error-text-content"
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
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getTensMultiplier } from '@injectivelabs/sdk-ts'
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

    hideErrors: {
      type: Boolean,
      default: false
    },

    maxSelector: {
      type: Boolean,
      default: false
    },

    showClose: {
      type: Boolean,
      default: false
    },

    showPrefix: {
      type: Boolean,
      default: false
    },

    showAddon: {
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

    inputClasses: {
      type: String,
      default: ''
    },

    transparentBg: {
      type: Boolean,
      default: false
    },

    prefix: {
      type: [Object, String, Number],
      default: null
    },

    maxClasses: {
      type: String,
      default: ''
    },

    disableAddonPadding: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    addonVisible(): boolean {
      const { showClose, isMaxValue, maxSelector, showAddon } = this

      return showClose || (!isMaxValue && maxSelector) || showAddon
    },

    wrapperClass(): string {
      const { dense, lg, xl, transparentBg, wrapperClasses } = this
      const classes = ['shadow-none']

      if (!dense) {
        classes.push('mt-2')
      }

      if (!lg && !xl && !transparentBg) {
        classes.push('input-wrapper')
      }

      classes.push(wrapperClasses)

      return classes.join(' ')
    },

    inputClass(): string {
      const { lg, xl, round, small, transparentBg, inputClasses } = this
      const classes = []

      if (small) {
        classes.push('input-small')
      }

      if (lg) {
        classes.push('input-lg')
      }

      if (xl) {
        classes.push('input-xl')
      }

      if (round) {
        classes.push('input-round')
      }

      if (transparentBg) {
        classes.push('input-bg-transparent')
      }

      classes.push(inputClasses)

      return classes.join(' ')
    },

    maxButtonClasses(): string[] {
      const { lg, maxClasses } = this

      if (lg) {
        return ['text-base', 'mr-2', 'p-0.5', maxClasses]
      }

      return ['px-2', 'py-1', 'mr-2', 'border', 'text-xs', maxClasses]
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

      return Number(max) === Number(value)
    },

    tensMultiplier(): number {
      const { step } = this.$attrs

      if (!step) {
        return 0
      }

      if (isNaN(Number(step))) {
        return 0
      }

      if (isNaN(Number(step))) {
        return 0
      }

      return getTensMultiplier(step)
    }
  },

  methods: {
    handlePaste(event: DOMEvent<HTMLInputElement>) {
      if (event.target.type === 'number') {
        event.preventDefault()
      }
    },

    handleChangeOnInput(event: DOMEvent<HTMLInputElement>) {
      const {
        target: { value, type }
      } = event

      if (!value) {
        return
      }

      return type !== 'number'
        ? this.handleChangeOnInputString(value)
        : this.handleChangeOnInputNumber(value)
    },

    handleChangeOnInputString(value: string) {
      this.$emit('input', value)
    },

    handleCloseEvent() {
      this.$emit('close')
    },

    handleChangeOnInputNumber(value: string) {
      const { maxDecimals } = this

      if (!value) {
        this.$emit('input', this.$attrs.step || '')
      }

      if (isNaN(Number(value))) {
        return
      }

      const formattedValueWithExtraDecimals = convertToNumericValue({
        value,
        maxDecimals: Math.min(maxDecimals * 2, 18)
      }).toString()

      this.$emit('input', formattedValueWithExtraDecimals)
      this.$forceUpdate()
    },

    handleKeydown(event: DOMEvent<HTMLInputElement>) {
      if (event.target.type !== 'number') {
        return this.$emit('keydown', event)
      }

      const additionalInvalidCharts = this.maxDecimals === 0 ? ['.'] : []

      if (passNumericInputValidation(event, additionalInvalidCharts)) {
        return this.$emit('keydown', event)
      }

      event.preventDefault()
    },

    handleBlur(e: Event) {
      const { $attrs } = this
      const { max, type } = $attrs
      const value = (e.target as HTMLInputElement).value.trim()

      if (type !== 'number') {
        return this.$emit('blur', value)
      }

      const numberValue = Number(value)

      if (max && numberValue > Number(max)) {
        return this.$emit('blur', max.toString())
      }

      if (isNaN(numberValue)) {
        return this.$emit('blue', '')
      }

      this.$emit('blur', value)
    },

    handleMaxSelector() {
      const { maxSelector, maxDecimals } = this
      const { max } = this.$attrs

      const value = new BigNumberInBase(max).toFixed(
        maxDecimals,
        BigNumber.ROUND_DOWN
      )

      if (max || maxSelector) {
        this.handleChangeOnInputString(value)
        this.$emit('input:max', value)
      } else if (max) {
        this.$emit('input:max')
      }
    }
  }
})
</script>
