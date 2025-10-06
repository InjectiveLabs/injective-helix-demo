<script lang="ts" setup>
import { create } from 'canvas-confetti'
import type { Options } from 'canvas-confetti'

const attrs = useAttrs()

const props = defineProps({
  confettiOptions: {
    type: Object as PropType<Options>,
    default: () => ({
      angle: 90,
      spread: 90,
      decay: 0.9,
      ticks: 800,
      gravity: 0.6,
      particleCount: 70,
      shapes: ['square', 'triangle'],
      origin: {
        y: 0
      }
    })
  }
})

const confetti = ref()
const canvas = ref<undefined | HTMLCanvasElement>()

const filteredAttrs = computed(() => {
  const filteredAttrs = { ...attrs }

  const classes = (filteredAttrs.class as string) || ''

  const defaultClasses = []

  if (!classes.includes('h-')) {
    defaultClasses.push('h-screen')
  }

  if (!classes.includes('w-')) {
    defaultClasses.push('w-screen')
  }

  return { ...attrs, class: [...defaultClasses, classes].join(' ') }
})

onMounted(() => {
  confetti.value = create(canvas.value)
  if (confetti.value) {
    confetti.value(props.confettiOptions)
  }
})
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none z-50"
    v-bind="filteredAttrs"
  />
</template>
