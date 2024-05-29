<script lang="ts" setup>
defineProps({
  isNotStyled: Boolean,

  textColorClass: {
    type: String,
    default: 'text-gray-350'
  },

  borderColorClass: {
    type: String,
    default: 'border-gray-400'
  },

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
        :class="[
          textColorClass,
          borderColorClass,
          {
            'text-xs normal-case border-dashed border-b  cursor-pointer':
              !isNotStyled
          }
        ]"
      >
        <slot />
      </span>
    </template>

    <template #content>
      {{ tooltip }}
    </template>
  </BaseHoverMenu>
</template>
