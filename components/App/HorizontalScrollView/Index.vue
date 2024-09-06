<script lang="ts" setup>
const props = withDefaults(defineProps<{ isCarousel: boolean }>(), {
  isCarousel: false
})

const views = ref<HTMLElement | null>(null)
const viewCount = ref(0)
const viewIndex = ref(0)
const hasFocus = ref(false)
const lastKnownOffsetX = ref(0)
const currentOffsetX = ref(0)
const touchStartX = ref(0)
const isTransitionEnabled = ref(true)

onMounted(() => {
  nextTick(modifyViewCount)
})

function resize() {
  modifyViewCount()
}

function scroll(e: WheelEvent): void {
  if (hasFocus.value && views.value) {
    const total = views.value.scrollWidth - views.value.clientWidth
    const deltaX = e.deltaX

    let newOffsetX = currentOffsetX.value - deltaX
    newOffsetX = Math.max(newOffsetX, 0)
    newOffsetX = Math.min(newOffsetX, total)

    currentOffsetX.value = newOffsetX

    modifyOffset(newOffsetX)
    modifyIndicators(newOffsetX)
  }
}

function touchMove(e: TouchEvent) {
  e.preventDefault()

  if (hasFocus.value && views.value) {
    const startX = touchStartX.value
    const currentX = getTouchPositionX(e)
    const offsetX = currentX - startX
    const total = views.value.scrollWidth - views.value.clientWidth
    const newOffsetX = clamp(currentOffsetX.value - offsetX, 0, total)

    modifyOffset(newOffsetX)
    modifyIndicators(newOffsetX)
  }
}

function scrollToIndex(index: number) {
  if (!views.value) {
    return
  }

  const total = views.value.scrollWidth
  const totalViewWidth = views.value.clientWidth * viewCount.value
  const totalPadding = total - totalViewWidth
  const padding = totalPadding / (viewCount.value - 1)
  const newOffsetX = views.value.clientWidth * index + padding * index

  animate()

  currentOffsetX.value = newOffsetX
  lastKnownOffsetX.value = newOffsetX

  modifyOffset(newOffsetX)
  modifyIndicators(newOffsetX)
}

function mouseEnter() {
  currentOffsetX.value = lastKnownOffsetX.value
  hasFocus.value = true
}

function mouseLeave() {
  hasFocus.value = false
  lastKnownOffsetX.value = currentOffsetX.value
}

function touchStart(e: TouchEvent) {
  if (isActive.value) {
    isTransitionEnabled.value = false
    pause()
  }

  currentOffsetX.value = lastKnownOffsetX.value
  touchStartX.value = getTouchPositionX(e)
  hasFocus.value = true
}

function touchEnd() {
  hasFocus.value = false

  if (!views.value) {
    return
  }

  lastKnownOffsetX.value = views.value.style.transform
    ? translationToVector(views.value.style.transform).x * -1
    : 0

  currentOffsetX.value = lastKnownOffsetX.value
}

function modifyOffset(offset: number) {
  if (!views.value) {
    return
  }

  views.value.style.transition = isTransitionEnabled.value
    ? 'transform 400ms ease-in-out'
    : 'none'
  views.value.style.transform = `translate3d(${offset * -1}px, 0, 0)`
}

function modifyIndicators(offsetX: number) {
  if (!views.value) {
    return
  }

  const total = views.value.scrollWidth

  viewIndex.value = Math.round((offsetX / total) * viewCount.value) || 0
}

function animate() {
  if (!views.value) {
    return
  }

  views.value.classList.add('animated')
  stop()
  start()
}

function modifyViewCount() {
  if (!views.value) {
    return
  }

  viewCount.value = views.value.children.length
}

function translationToVector(translation: string) {
  const values = translation
    .split(/\w+\(|\);?/gim)[1]
    .split(/,\s?/g)
    .map(parseFloat)

  const x = values[0] || 0
  const y = values[1] || 0
  const z = values[2] || 0

  return { x, y, z }
}

function getTouchPositionX(e: TouchEvent) {
  const touch = e.touches[0] || e.changedTouches[0]

  return touch.pageX
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function onClickIndicator(index: number) {
  if (isActive.value) {
    isTransitionEnabled.value = false
    pause()
  }

  scrollToIndex(index)
}

useEventListener(window, 'wheel', scroll)
useEventListener(window, 'resize', resize)

const { start, stop } = useTimeoutFn(() => {
  if (!views.value) {
    return
  }

  views.value.classList.remove('animated')
}, 200)

const { pause, isActive } = useIntervalFn(() => {
  if (!props.isCarousel) {
    pause()

    return
  }

  const nextIndex = viewIndex.value + 1

  if (nextIndex === viewCount.value && views.value) {
    isTransitionEnabled.value = false

    // Set to last position so first card can fly in from the right
    currentOffsetX.value = -views.value.clientWidth
    modifyOffset(-views.value.clientWidth)

    return nextTick(() => {
      isTransitionEnabled.value = true
      viewIndex.value = 0

      scrollToIndex(viewIndex.value)
    })
  }

  viewIndex.value = nextIndex
  scrollToIndex(viewIndex.value)
}, 7000)
</script>

<template>
  <div>
    <div
      class="overflow-x-hidden hide-scrollbar"
      @mouseenter="mouseEnter"
      @mouseleave="mouseLeave"
      @touchstart="touchStart"
      @touchend="touchEnd"
      @touchmove="touchMove"
    >
      <div ref="views" class="flex md:grid grid-cols-12 gap-6 views">
        <slot />
      </div>
    </div>
    <div class="flex gap-2 justify-center mt-4 md:hidden">
      <AppHorizontalScrollViewIndicator
        v-for="index in viewCount"
        :key="`horizontal-scroll-view-indicator-${index}`"
        :is-active="viewIndex === index - 1"
        @click="onClickIndicator(index - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.views {
  transform: translate3d(0, 0, 0);
  transform-origin: top left;
  will-change: transform;
}

.views.animated {
  transition: transform 200ms ease-in-out;
}
</style>
