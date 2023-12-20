<script lang="ts" setup>
defineProps({
  isNotStyled: Boolean,

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
            !isNotStyled
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
