<script lang="ts" setup>
defineProps({
  isNotStyled: Boolean,

  textColorClass: {
    type: String,
    default: 'text-gray-350'
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
          {
            'text-xs normal-case border-dashed border-b border-gray-400 cursor-pointer':
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
