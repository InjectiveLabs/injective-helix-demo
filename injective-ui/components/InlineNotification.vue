<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const timeoutId = setTimeout(() => {
  closeNotification()
}, 7000)

function closeNotification() {
  clearTimeout(timeoutId)
  emit('close')
}

onUnmounted(() => {
  clearTimeout(timeoutId)
})
</script>

<template>
  <div
    class="rounded-xl flex"
  >
    <p class="flex-1">
      <slot />
    </p>
    <div class="items-start" @click="closeNotification">
      <button>
        <SharedIcon name="close" is-md />
      </button>
    </div>
  </div>
</template>
