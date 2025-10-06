<script setup lang="ts">
const childEl = useTemplateRef('childRef')

const height = ref(0)

let observer: null | ResizeObserver = null

onMounted(() => {
  height.value = childEl.value?.clientHeight || 0

  observer = new ResizeObserver((entries) => {
    height.value = entries[0].contentRect.height
  })

  observer.observe(childEl.value as Element)

  onUnmounted(() => {
    observer?.disconnect()
  })
})
</script>

<template>
  <div
    class="overflow-hidden transition-all duration-300"
    :style="{
      height: `${height}px`
    }"
  >
    <div ref="childRef">
      <slot />
    </div>
  </div>
</template>