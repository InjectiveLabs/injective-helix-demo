<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { BigNumberInBase } from '@injectivelabs/utils'
import type { FactoryOpts } from 'imask'

const props = withDefaults(
  defineProps<{
    max?: number
    min?: number
    decimals?: number
    noStyle?: boolean
    autofix?: boolean
    disabled?: boolean
    alignLeft?: boolean
    modelValue?: string
    wrapperClass?: string
    inputClasses?: string
  }>(),
  {
    // eslint-disable-next-line
    max: 9999999999999999999,
    min: undefined,
    decimals: 18,
    modelValue: '',
    wrapperClass: '',
    inputClasses: ''
  }
)

const emit = defineEmits<{
  blur: [value: string]
  'update:modelValue': [value: string]
}>()

const appStore = useAppStore()

const thousandsSeparator = computed(() =>
  appStore.userState.preferences.thousandsSeparator ? ',' : ''
)

const inputClass = computed(() => {
  const result = ['bg-transparent p-2 flex-1 min-w-0 focus:outline-none']

  if (props.disabled) {
    result.push('cursor-not-allowed')
  }

  if (thousandsSeparator.value && !props.alignLeft) {
    result.push('text-right')
  }

  result.push(props.inputClasses)

  return result.join(' ')
})

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
        : 'block focus-within:focus-ring transition-all duration-300 border border-[#181E31] rounded-md bg-brand-875 text-sm py-2 px-4',
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
        :class="inputClass"
        :cy-value="typed?.value || modelValue"
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
