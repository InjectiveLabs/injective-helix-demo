<script setup lang="ts">
import lottie from 'lottie-web'
import type { AnimationItem } from 'lottie-web'

const emit = defineEmits<{
  'animation:ready': [value: string]
}>()

const props = withDefaults(
  defineProps<{
    name: string
    lottieKey?: string
  }>(),
  { lottieKey: '' }
)

const lottieContainer = ref()

let lottiePlayer: null | AnimationItem = null

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

  lottiePlayer.addEventListener('DOMLoaded', () => {
    emit('animation:ready', props.lottieKey)
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
