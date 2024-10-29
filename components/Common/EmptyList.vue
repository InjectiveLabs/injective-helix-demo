<script lang="ts" setup>
const slots = useSlots()

withDefaults(defineProps<{ message?: string }>(), {
  message: ''
})
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center py-8">
    <div class="mx-auto mb-3">
      <slot v-if="slots.icon" name="icon" />

      <img v-else src="/svg/empty-list.svg" />
    </div>

    <p class="text-sm text-coolGray-400">
      {{ message }}
    </p>

    <slot />
  </div>
</template>
