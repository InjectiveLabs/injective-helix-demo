<script setup lang="ts">
import { useIMask } from 'vue-imask'
import type { FactoryOpts } from 'imask'

const props = defineProps({
  noStyle: Boolean,
  autofix: Boolean,

  wrapperClass: {
    type: String,
    default: ''
  },

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

const appStore = useAppStore()

const thousandsSeparator = computed(() =>
  appStore.userState.preferences.thousandsSeparator ? ',' : ''
)

const { el, typed } = useIMask(
  computed(
    () =>
      ({
        mask: 'num',
        lazy: false,
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: thousandsSeparator.value,
            radix: '.',
            mapToRadix: ['.', ','],
            scale: props.decimals,
            autofix: props.autofix,
            max: props.max,
            min: props.min
          }
        }
      }) as FactoryOpts
  ),
  {
    onAccept: () => {
      if (props.modelValue !== typed.value) {
        emit('update:modelValue', typed.value)
      }
    }
  }
)

watch(
  () => props.modelValue,
  (value) => {
    nextTick(() => {
      typed.value = value
    })
  },
  { immediate: true }
)
</script>

<template>
  <input
    ref="el"
    type="text"
    class="bg-transparent focus:outline-none font-mono"
    :class="thousandsSeparator ? 'text-right' : ''"
    v-bind="$attrs"
  />
</template>
