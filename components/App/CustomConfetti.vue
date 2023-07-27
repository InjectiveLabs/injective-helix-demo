<script lang="ts" setup>
import { create, Options } from 'canvas-confetti'

const attrs = useAttrs()

const props = defineProps({
  confettiOptions: {
    type: Object as PropType<Options>,
    default: () => ({
      particleCount: 100,
      spread: 160
    })
  }
})

const confetti = ref()
const canvas = ref(undefined as HTMLCanvasElement | undefined)

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
  confetti.value(props.confettiOptions)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none z-50"
    v-bind="filteredAttrs"
  />
</template>
