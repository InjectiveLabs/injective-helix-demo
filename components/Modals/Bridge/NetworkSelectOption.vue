<script lang="ts" setup>
import { PropType } from 'vue'
import { DropdownOption } from '@/types'

defineProps({
  active: Boolean,
  selected: Boolean,

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
      :class="{ 'w-6 h-6 min-w-6': !selected, 'w-10 h-10 min-w-10': selected }"
    />

    <span
      class="tracking-1"
      :class="{ 'text-2xl': selected }"
      data-cy="network-selector-selected-option-text-content"
    >
      {{ option.display }}
    </span>
  </div>
</template>
