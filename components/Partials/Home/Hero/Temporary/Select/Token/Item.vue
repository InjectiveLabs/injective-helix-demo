<script lang="ts" setup>
import type { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  sm: Boolean,
  xl: Boolean,
  showTokenName: Boolean,
  lgTokenIcon: Boolean,

  token: {
    type: Object as PropType<Token>,
    required: true
  }
})

const emit = defineEmits<{
  click: [state: string]
}>()

const classes = computed(() => {
  if (props.sm) {
    return 'text-sm'
  }

  if (props.xl) {
    return 'text-xl'
  }

  return 'text-base'
})

function handleClick() {
  emit('click', props.token.denom)
}
</script>

<template>
  <div class="flex items-center justify-between" @click="handleClick">
    <Transition name="fade-down" mode="out-in">
      <div class="flex items-center gap-2">
        <CommonTokenIcon v-bind="{ token: token, lg: lgTokenIcon }" />

        <div
          class="flex flex-col max-w-2xs truncate text-gray-600 font-semibold"
          :class="classes"
        >
          <span>
            {{ token.symbol }}
          </span>

          <span v-if="showTokenName">
            {{ token.name }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
