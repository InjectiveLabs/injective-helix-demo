<script lang="ts" setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})

const slots = useSlots()
</script>

<template>
  <div
    class="h-full w-full flex flex-col items-center justify-center py-3"
    :class="{ 'bg-gray-900': !$attrs.class }"
  >
    <div class="mx-auto mb-3">
      <slot v-if="slots.icon" name="icon" />

      <img v-else src="/svg/empty-list.svg" />
    </div>

    <p class="text-sm">
      {{ message }}
    </p>

    <slot />
  </div>
</template>
