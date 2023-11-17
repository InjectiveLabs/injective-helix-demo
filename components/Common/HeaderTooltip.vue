<script lang="ts" setup>
defineProps({
  isNoStyling: Boolean,

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
            !isNoStyling
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
