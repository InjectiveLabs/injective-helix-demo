<script setup lang="ts">
import { NuxtUiIcons } from '../types'

const props = withDefaults(
  defineProps<{
    ui?: object
    cardUi?: object
    appear?: boolean
    overlay?: boolean
    modelValue?: boolean
    transition?: boolean
    fullscreen?: boolean
    preventClose?: boolean
    isHideCloseButton?: boolean
    class?: string | object | string[]
  }>(),
  {
    overlay: true,
    transition: true,
    ui: () => ({}),
    class: () => '',
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

function onClose() {
  isOpen.value = false

  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      emit('on:open')
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    emit('on:open')
  }
})
</script>

<template>
  <UModal
    v-model="isOpen"
    v-bind="{
      ui,
      appear,
      overlay,
      transition,
      fullscreen,
      preventClose,
      class: props.class
    }"
  >
    <UCard v-bind="{ ui: cardUi }">
      <UButton
        v-if="!isHideCloseButton && !preventClose"
        :class="[
          $slots.header ? 'top-5' : 'top-6',
          'absolute max-sm:right-4 right-6 z-10 text-white hover:text-gray-300 dark:text-white dark:hover:text-gray-300 transition p-0 hover:bg-transparent hover:dark:bg-transparent focus-visible:ring-0'
        ]"
        variant="ghost"
        @click="onClose"
      >
        <UIcon :name="NuxtUiIcons.Close" class="block size-5 min-w-5" />
      </UButton>

      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>

      <slot />

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </UCard>
  </UModal>
</template>
