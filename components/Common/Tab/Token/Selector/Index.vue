<script setup lang="ts">
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    tokens: TokenStatic[]
    modelValue: string
  }>(),
  {
    tokens: () => [],
    modelValue: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function setToken(token: TokenStatic) {
  isOpen.value = false
  emit('update:modelValue', token.denom)
}

const activeToken = computed(() =>
  props.tokens.find((token) => token.denom === props.modelValue)
)
</script>

<template>
  <div class="flex items-center tab-label px-8" @click="openModal">
    <p v-if="!activeToken">{{ 'Filter By Asset' }}</p>

    <p v-else>
      {{ activeToken?.symbol }}
    </p>

    <div class="flex items-center pl-2">
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>
  </div>

  <AppHocModal v-bind="{ isOpen }" @modal:close="closeModal">
    <CommonTokenSelector v-bind="{ tokens }" @set:token="setToken" />
  </AppHocModal>
</template>
