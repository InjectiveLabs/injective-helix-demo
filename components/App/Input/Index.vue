<script lang="ts" setup>
import { PropType } from 'vue'

const slots = useSlots()

const props = defineProps({
  sm: Boolean,
  valid: Boolean,
  noPadding: Boolean,
  transparentBg: Boolean,

  errors: {
    type: Array as PropType<string[]>,
    default: () => []
  },

  inputClasses: {
    type: String,
    default: ''
  },

  wrapperClasses: {
    type: String,
    default: ''
  }
})

const wrapperClass = computed(() => {
  const result = ['shadow-none']

  if (!props.transparentBg) {
    result.push('input-wrapper')
  }

  result.push(props.wrapperClasses)

  return result.join(' ')
})

const inputClass = computed(() => {
  const result = []

  if (!props.noPadding) {
    result.push('px-3')
  }

  if (props.sm) {
    result.push('h-8')
  }

  if (props.transparentBg) {
    result.push('input-bg-transparent')
  }

  result.push(props.inputClasses)

  return result.join(' ')
})

const classes = computed(() => {
  const result = ['w-full']

  if (props.valid) {
    result.push('is-valid')
  }

  if (!props.valid && props.errors.length > 0) {
    result.push('is-invalid')
  }

  return result.join(' ')
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div class="w-full input-wrap" :class="classes">
    <div>
      <div class="flex items-center justify-between">
        <label
          v-if="$attrs.label"
          class="block text-xs font-semibold text-gray-300 mb-2"
        >
          {{ $attrs.label || '' }}
        </label>

        <div v-if="slots.context" class="leading-none">
          <slot name="context" />
        </div>
      </div>
      <div class="relative" :class="wrapperClass">
        <div class="flex items-center justify-between no-shadow">
          <div v-if="slots.prefix" class="ml-3">
            <slot name="prefix" />
          </div>

          <BaseInput v-bind="$attrs" :class="inputClass" />

          <div v-if="slots.addon" class="mr-3">
            <slot name="addon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
