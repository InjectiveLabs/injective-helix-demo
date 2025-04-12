<script lang="ts" setup>
import lottie, { AnimationItem } from 'lottie-web'
import { ThrownException } from '@injectivelabs/exceptions'

const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    loop?: boolean
    name: string
    autoplay?: boolean
    animationData?: object
  }>(),
  {
    loop: false,
    autoplay: true,
    animationData: undefined
  }
)

const animation = ref<AnimationItem | null>(null)
const lottieContainer = ref()

onMounted(async () => {
  const animationData = await loadAnimationData(props.name)

  animation.value = lottie.loadAnimation({
    ...props,
    container: lottieContainer.value,
    renderer: 'svg',
    animationData
  })
})

async function loadAnimationData(name: string) {
  try {
    const lottieFiles = import.meta.glob('../../app/data/lottie/*.json')

    const module = (await lottieFiles[
      `../../app/data/lottie/${name}.json`
    ]()) as Record<string, any>

    return module.default
  } catch (e) {
    $onError(e as ThrownException)
  }
}
</script>

<template>
  <div ref="lottieContainer" />
</template>
