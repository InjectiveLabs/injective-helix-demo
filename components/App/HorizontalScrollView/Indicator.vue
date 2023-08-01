<script lang="ts" setup>
defineProps({
  active: Boolean
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="w-2 h-2 rounded-full bg-white cursor-pointer"
    :class="{ 'bg-opacity-50': active, 'bg-opacity-10': !active }"
    @click="emit('click')"
  />
</template>
