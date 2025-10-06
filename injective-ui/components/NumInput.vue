<script setup lang="ts">
import { useIMask } from 'vue-imask'
import type { FactoryOpts } from 'imask'
import { BigNumberInBase } from '@injectivelabs/utils'

const props = defineProps({
  isAutofix: Boolean,
  isShowMask: Boolean,

  modelValue: {
    type: [String, Number],
    default: ''
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  max: {
    type: Number,
    default: undefined
  },

  min: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hardCodedIMaskOptions = {
  mask: 'num',
  lazy: false,
  blocks: {
    num: {
      mask: Number,
      radix: '.',
      mapToRadix: ['.']
    }
  }
}

const { typed, el } = useIMask(
  computed(
    () =>
      ({
        ...hardCodedIMaskOptions,
        blocks: {
          num: {
            ...hardCodedIMaskOptions.blocks.num,
            min: props.min,
            max: props.max,
            scale: props.maxDecimals,
            isAutofix: props.isAutofix,
            thousandsSeparator: props.isShowMask ? ',' : ''
          }
        }
      }) as FactoryOpts
  ),
  {
    onAccept: (event) => {
      // emit event only if event is triggered by user input
      if (event && props.modelValue !== typed.value) {
        nextTick(() => emit('update:modelValue', `${typed.value}`))
      }
    }
  }
)

function onPaste(e: ClipboardEvent) {
  if (!e.clipboardData) {
    return
  }

  e.preventDefault()

  const text = e.clipboardData.getData('text/plain').replaceAll(',', '')
  const value = new BigNumberInBase(text).toFixed(props.maxDecimals)

  typed.value = value
  emit('update:modelValue', `${typed.value}`)
}

watch(
  () => props.modelValue,
  (value) => {
    nextTick(() => (typed.value = value))
  },
  { immediate: true }
)
</script>

<template>
  <input
    ref="el"
    type="text"
    class="input-base"
    v-bind="$attrs"
    @paste="onPaste"
  />
</template>
