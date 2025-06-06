<script lang="ts" setup>
const slots = useSlots()

const props = withDefaults(
  defineProps<{
    isSm?: boolean
    isValid?: boolean
    isRight?: boolean
    isDisabled?: boolean
    isNoPadding?: boolean
    isDisabledGray?: boolean
    isTransparentBg?: boolean
    errors?: string[]
    inputClasses?: string
    wrapperClasses?: string
  }>(),
  {
    isSm: false,
    errors: () => [],
    isValid: false,
    isRight: false,
    isDisabled: false,
    isNoPadding: false,
    inputClasses: '',
    wrapperClasses: '',
    isDisabledGray: false,
    isTransparentBg: false
  }
)

const emit = defineEmits<{
  blur: [value: string]
}>()

const wrapperClass = computed(() => {
  const result = ['shadow-none']

  if (!props.isTransparentBg) {
    result.push('input-wrapper p-0')
  }

  result.push(props.wrapperClasses)

  return result.join(' ')
})

const inputClass = computed(() => {
  const result = []

  if (!props.isNoPadding) {
    result.push('px-3')
  }

  if (props.isSm) {
    result.push('h-8')
  }

  if (props.isTransparentBg) {
    result.push('input-bg-transparent')
  }

  if (props.isRight) {
    result.push('text-right')
  }

  result.push(props.inputClasses)

  return result.join(' ')
})

const classes = computed(() => {
  const result = ['w-full']

  if (props.isValid) {
    result.push('is-valid')
  }

  if (!props.isValid && props.errors.length > 0) {
    result.push('is-invalid')
  }

  return result.join(' ')
})

function onBlur(e?: Event) {
  const { value } = e?.target as HTMLInputElement

  if (isNaN(parseInt(value))) {
    return
  }

  debounceOnBlur(value)
}

const debounceOnBlur = useDebounceFn(
  (value: string) => emit('blur', value),
  500
)
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
        <div v-if="slots.context" class="leading-none">
          <slot name="context" />
        </div>
      </div>
      <div :class="wrapperClass" class="overflow-hidden">
        <div
          class="flex items-center justify-between no-shadow"
          :class="{ 'bg-coolGray-700': isDisabled && isDisabledGray }"
        >
          <div v-if="slots.prefix" class="ml-3">
            <slot name="prefix" />
          </div>

          <SharedNumericInput
            v-bind="$attrs"
            :class="inputClass"
            class="input"
            :disabled="isDisabled"
            @blur="onBlur"
          >
            />

            <div v-if="slots.max" class="mr-3">
              <slot name="max" />
            </div>

            <div v-if="slots.addon" class="mr-3 text-coolGray-300">
              <slot name="addon" />
            </div>
          </SharedNumericInput>

          <div v-if="slots.postfix" class="mx-3">
            <slot name="postfix" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
