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
      <span
        :class="{
          'text-gray-350 text-xs normal-case border-dashed border-b border-gray-400 cursor-pointer':
            !noStyling
        }"
      >
        <slot />
      </span>
    </template>

    <template #content>
      {{ tooltip }}
    </template>
  </BaseHoverMenu>
</template>
