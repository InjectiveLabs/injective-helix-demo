<script lang="ts" setup>
const canvas = ref(null)

const { init } = useConfetti()

onMounted(() => {
  init(canvas)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-1200"
  />
</template>
