<script lang="ts" setup>
const canvas = ref(null)

onMounted(() => {
  useConfetti().init(canvas)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-50"
  />
</template>
