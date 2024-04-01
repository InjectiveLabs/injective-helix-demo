<script lang="ts" setup>
import type { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  isSm: Boolean,
  isXl: Boolean,
  isTokenNameVisible: Boolean,
  isLgTokenIcon: Boolean,

  token: {
    type: Object as PropType<Token>,
    required: true
  }
})

const emit = defineEmits<{
  click: [state: string]
}>()

const classes = computed(() => {
  if (props.isSm) {
    return 'text-sm'
  }

  if (props.isXl) {
    return 'text-xl'
  }

  return 'text-base'
})

function click() {
  emit('click', props.token.denom)
}
</script>

<template>
  <div class="flex items-center justify-between" @click="click">
    <div class="flex items-center gap-2">
      <CommonTokenIcon v-bind="{ token: token, isLg: isLgTokenIcon }" />

      <div
        class="flex flex-col max-w-2xs truncate text-gray-600 font-semibold"
        :class="classes"
      >
        <span>
          {{ token.symbol }}
        </span>

        <span v-if="isTokenNameVisible">
          {{ token.name }}
        </span>
      </div>
    </div>
  </div>
</template>
