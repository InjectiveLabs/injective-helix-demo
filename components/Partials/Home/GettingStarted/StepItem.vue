<script lang="ts" setup>
defineProps({
  step: {
    type: Number,
    required: true
  },

  value: {
    type: String,
    required: true
  },

  modelValue: {
    type: String,
    required: true
  }
})
</script>

<template>
  <BaseSelectorItem
    :model-value="modelValue"
    :value="value"
    v-bind="$attrs"
    class="flex-grow"
  >
    <template #default="{ isActive }">
      <div
        class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px]"
        :class="{
          'opacity-50': !isActive
        }"
      >
        <div
          class="w-8 h-8 ml-6 rounded-full flex items-center justify-center"
          :class="[isActive ? 'bg-blue-500' : 'bg-gray-600 opacity-50']"
        >
          <span class="font-semibold text-white">{{ step }}</span>
        </div>
        <slot />
      </div>
    </template>
  </BaseSelectorItem>
</template>
