<script setup lang="ts">
import { SpotTradeFormField } from '~/types'

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

const { value: postOnlyValue } = useBooleanField({
  name: SpotTradeFormField.PostOnly,
  initialValue: false
})
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center cursor-pointer py-2"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">Advanced Settings</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <BaseIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4">
        <AppCheckbox v-model="postOnlyValue">Post Only</AppCheckbox>
      </div>
    </AppCollapse>
  </div>
</template>
