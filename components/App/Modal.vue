<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    ui?: object
    isSm?: boolean
    isMd?: boolean
    isLg?: boolean
    isXl?: boolean
    cardUi?: object
    modelValue?: boolean
    isAlwaysOpen?: boolean
    isHideCloseButton?: boolean
  }>(),
  {
    ui: () => ({}),
    cardUi: () => ({})
  }
)

const emit = defineEmits<{
  'on:open': []
  'on:close': []
  'update:modelValue': [modelValue: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!value) {
      emit('on:close')
    }

    emit('update:modelValue', value)
  }
})

const maxWidthClass = computed(() => {
  const result = ['max-sm:w-full w-auto']

  if (props.isSm) {
    result.push('sm:min-w-lg sm:max-w-lg')
  } else if (props.isMd) {
    result.push('md:min-w-lg lg:max-w-2xl')
  } else if (props.isLg) {
    result.push('lg:max-w-3xl')
  } else if (props.isXl) {
    result.push('lg:max-w-5xl')
  } else {
    result.push('sm:min-w-md sm:max-w-md')
  }

  return result.join(' ')
})

function onOpen() {
  emit('on:open')
}

function onClose() {
  emit('on:close')
}

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <SharedModal
    v-model="isOpen"
    v-bind="{
      cardUi,
      isHideCloseButton,
      ui: {
        width: maxWidthClass,
        ...ui
      },
      preventClose: isAlwaysOpen
    }"
    @on:open="onOpen"
    @on:close="onClose"
    @update:model-value="onUpdateModelValue"
  >
    <template v-if="$slots.title" #header>
      <div class="text-sm uppercase text-coolGray-100 font-semibold">
        <slot name="title" />
      </div>
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </SharedModal>
</template>
