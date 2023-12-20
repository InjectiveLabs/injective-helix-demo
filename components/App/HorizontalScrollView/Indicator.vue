<script lang="ts" setup>
defineProps({
  isActive: Boolean
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="w-2 h-2 rounded-full bg-white cursor-pointer"
    :class="{ 'bg-opacity-50': isActive, 'bg-opacity-10': !isActive }"
    @click="emit('click')"
  />
</template>
