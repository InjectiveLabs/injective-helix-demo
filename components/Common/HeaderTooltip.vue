<script lang="ts" setup>
defineProps({
  isDisabled: Boolean,
  isNotStyled: Boolean,

  classes: {
    type: String,
    default: ''
  },

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
  <SharedHoverMenu popper-class="tooltip" :disabled="isDisabled">
    <template #default>
      <span
        :class="[
          classes,
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
  </SharedHoverMenu>
</template>
