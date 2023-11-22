<script lang="ts" setup>
import { DropdownOption } from '@/types'

defineProps({
  isSelected: Boolean,

  option: {
    type: Object as PropType<DropdownOption>,
    required: true
  }
})
</script>

<template>
  <div class="flex items-center justify-start gap-3">
    <img
      v-if="option.icon"
      :src="option.icon"
      :alt="option.display"
      class="selected-icon rounded-full"
      :class="{
        'w-6 h-6 min-w-6': !isSelected,
        'w-10 h-10 min-w-10': isSelected
      }"
    />

    <span
      class="tracking-1"
      :class="{ 'text-2xl': isSelected }"
      data-cy="network-selector-selected-option-text-content"
    >
      {{ option.display }}
    </span>
  </div>
</template>
