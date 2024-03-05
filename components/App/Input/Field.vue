<script setup lang="ts">
import { useIMask } from 'vue-imask'
import type { FactoryOpts } from 'imask'

const props = defineProps({
  autofix: Boolean,

  modelValue: {
    type: String,
    default: ''
  },

  decimals: {
    type: Number,
    default: 18
  },

  max: {
    type: Number,
    // eslint-disable-next-line
    default: 9999999999999999999
  },

  min: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { typed, el } = useIMask(
  computed(
    () =>
      ({
        mask: 'num',
        lazy: false,
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: '',
            radix: '.',
            mapToRadix: ['.', ','],
            scale: props.decimals,
            autofix: props.autofix,
            max: props.max,
            min: props.min
          }
        }
      }) as FactoryOpts
  )
)

watch(typed, (value) => {
  emit('update:modelValue', value)
})

watch(
  () => props.modelValue,
  (value) => {
    typed.value = value
  }
)
</script>

<template>
  <label
    class="flex flex-col focus-within:focus-ring transition-all duration-300 border border-brand-725 rounded-md bg-brand-875 text-sm py-2 px-4"
  >
    <div v-if="$slots.top">
      <slot name="top" />
    </div>

    <div class="flex">
      <div v-if="$slots.left" class="flex items-center">
        <slot name="left" />
      </div>

      <input
        ref="el"
        type="text"
        class="bg-transparent p-2 flex-1 min-w-0 focus:outline-none font-mono"
        v-bind="$attrs"
      />

      <div v-if="$slots.right" class="flex items-center">
        <slot name="right" />
      </div>
    </div>

    <div v-if="$slots.bottom">
      <slot name="bottom" />
    </div>
  </label>
</template>
