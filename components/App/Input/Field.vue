<script setup lang="ts">
import { useIMask } from 'vue-imask'
import type { FactoryOpts } from 'imask'
import { BigNumberInBase } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    noStyle?: boolean
    autofix?: boolean
    disabled?: boolean
    wrapperClass?: string
    modelValue?: string
    decimals?: number
    max?: number
    min?: number
  }>(),
  {
    noStyle: false,
    autofix: false,
    disabled: false,
    wrapperClass: '',
    modelValue: '',
    decimals: 18,
    // eslint-disable-next-line
    max: 9999999999999999999,
    min: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [value: string]
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
            mapToRadix: ['.'],
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

function onBlur() {
  debounceOnBlur(typed.value)
}

const debounceOnBlur = useDebounceFn(
  (value: string) => emit('blur', value),
  500
)

function onPaste(e: ClipboardEvent) {
  if (!e.clipboardData) {
    return
  }

  e.preventDefault()

  const text = e.clipboardData.getData('text/plain').replaceAll(',', '')
  const value = new BigNumberInBase(text).toFixed(props.decimals)

  typed.value = value
}

watch(
  () => props.modelValue,
  (value) => {
    nextTick(() => {
      typed.value = value
    })
  },
  { immediate: true }
)

onMounted(() => {
  setTimeout(() => {
    typed.value = props.modelValue
  }, 0)
})
</script>

<template>
  <label
    :class="[
      noStyle
        ? wrapperClass
        : 'block focus-within:focus-ring transition-all duration-300 border border-brand-725 rounded-md bg-brand-875 text-sm py-2 px-4',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
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
        :class="{
          'cursor-not-allowed': disabled,
          'text-right': thousandsSeparator
        }"
        v-bind="$attrs"
        :disabled="disabled"
        @blur="onBlur"
        @paste="onPaste"
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
