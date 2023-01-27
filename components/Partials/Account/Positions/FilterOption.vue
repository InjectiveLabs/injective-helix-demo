<script lang="ts" setup>
import { PropType } from 'vue'
import { DropdownOptionWithToken } from '@/types'

defineProps({
  active: Boolean,

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
      :class="{ 'text-white': !active, 'text-blue-500': active }"
    >
      {{ option.display }}
    </span>
  </div>
</template>
