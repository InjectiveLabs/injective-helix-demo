<script setup lang="ts">
import lottie, { AnimationItem } from 'lottie-web'
const props = withDefaults(
  defineProps<{
    name: string
  }>(),
  {}
)

const lottieContainer = ref()

let lottiePlayer: AnimationItem | null = null

watchEffect(() => {
  if (!lottieContainer.value) return

  if (lottiePlayer) {
    lottiePlayer.destroy()
  }

  lottiePlayer = lottie.loadAnimation({
    container: lottieContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: `/lottie/${props.name}`
  })
})

onUnmounted(() => {
  if (lottiePlayer) {
    lottiePlayer.destroy()
  }
})
</script>

<template>
  <div ref="lottieContainer" />
</template>
