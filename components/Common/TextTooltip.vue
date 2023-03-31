<script setup lang="ts">
defineProps({
  noStyling: Boolean,

  tooltip: {
    type: String,
    required: true
  }
})
</script>

<template>
  <BaseHoverMenu popper-class="tooltip">
    <template #default>
      <span v-if="noStyling">
        <slot />
      </span>
      <span
        v-else
        class="text-gray-350 text-xs normal-case border-dashed border-b border-gray-400 cursor-pointer"
      >
        <slot />
      </span>
    </template>

    <template #content>
      {{ tooltip }}
    </template>
  </BaseHoverMenu>
</template>
