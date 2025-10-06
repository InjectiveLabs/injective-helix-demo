<script lang="ts" setup>
import JSConfetti from 'js-confetti'

const canvas = ref<HTMLCanvasElement | undefined>()
const confetti = ref<JSConfetti>()

onMounted(() => {
  confetti.value = new JSConfetti({
    canvas: canvas.value
  })

  if (confetti.value) {
    confetti.value.addConfetti()
  }
})
</script>

<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-50"
  />
</template>
