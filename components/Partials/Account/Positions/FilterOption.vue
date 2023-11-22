<script lang="ts" setup>
import { DropdownOptionWithToken } from '@/types'

defineProps({
  isActive: Boolean,

  option: {
    type: Object as PropType<DropdownOptionWithToken>,
    required: true
  }
})
</script>

<template>
  <div class="flex items-end justify-start gap-2">
    <CommonTokenIcon v-if="option && option.token" :token="option.token" />
    <span
      class="text-sm"
      :class="{
        'text-white': !isActive,
        'text-blue-500 group-hover:text-white': isActive
      }"
    >
      {{ option.display }}
    </span>
  </div>
</template>
