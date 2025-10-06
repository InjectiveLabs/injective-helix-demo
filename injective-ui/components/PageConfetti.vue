<script lang="ts" setup>
import JSConfetti from 'js-confetti'

const canvas = ref<HTMLCanvasElement | undefined>()

onMounted(() => {
  useSharedConfetti().init(canvas)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-50"
  />
</template>
