<script lang="ts" setup>
defineProps({
  isActive: Boolean
})

const emit = defineEmits<{
  click: []
}>()

function click() {
  emit('click')
}
</script>

<template>
  <button class="flex justify-start gap-2" @click.stop="click">
    <div class="w-4 h-4 border border-white rounded-full p-[3px]">
      <div v-if="isActive" class="w-full h-full bg-white rounded-full" />
    </div>
    <div class="flex flex-col gap-2 justify-center items-start">
      <slot name="label" />
      <slot name="addon" />
    </div>
  </button>
</template>
