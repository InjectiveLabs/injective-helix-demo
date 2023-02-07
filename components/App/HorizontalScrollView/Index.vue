<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from 'vue'

const views = ref<HTMLElement | null>(null)
const viewCount = ref(0)
const viewIndex = ref(0)
const hasFocus = ref(false)
const lastKnownOffsetX = ref(0)
const currentOffsetX = ref(0)
const touchStartX = ref(0)
const animationTimeout = ref(undefined) as any

onMounted(() => {
  window.addEventListener('wheel', handleScroll)
  window.addEventListener('resize', handleResize)

  nextTick(updateViewCount)
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleScroll)
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  updateViewCount()
}

function handleScroll(e: WheelEvent): void {
  if (hasFocus.value && views.value) {
    const total = views.value.scrollWidth - views.value.clientWidth
    const deltaX = e.deltaX

    let newOffsetX = currentOffsetX.value - deltaX
    newOffsetX = Math.max(newOffsetX, 0)
    newOffsetX = Math.min(newOffsetX, total)

    currentOffsetX.value = newOffsetX

    updateOffset(newOffsetX)
    updateIndicators(newOffsetX)
  }
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()

  if (hasFocus.value && views.value) {
    const startX = touchStartX.value
    const currentX = getTouchPositionX(e)
    const offsetX = currentX - startX
    const total = views.value.scrollWidth - views.value.clientWidth
    const newOffsetX = clamp(currentOffsetX.value - offsetX, 0, total)

    updateOffset(newOffsetX)
    updateIndicators(newOffsetX)
  }
}

function handleScrollToIndex(index: number) {
  if (!views.value) {
    return
  }

  const total = views.value.scrollWidth
  const totalViewWidth = views.value.clientWidth * viewCount.value
  const totalPadding = total - totalViewWidth
  const padding = totalPadding / (viewCount.value - 1)
  const newOffsetX = views.value.clientWidth * index + padding * index

  updateAnimationClasses()

  currentOffsetX.value = newOffsetX
  lastKnownOffsetX.value = newOffsetX

  updateOffset(newOffsetX)
  updateIndicators(newOffsetX)
}

function handleMouseEnter() {
  currentOffsetX.value = lastKnownOffsetX.value
  hasFocus.value = true
}

function handleMouseLeave() {
  hasFocus.value = false
  lastKnownOffsetX.value = currentOffsetX.value
}

function handleTouchStart(e: TouchEvent) {
  currentOffsetX.value = lastKnownOffsetX.value
  touchStartX.value = getTouchPositionX(e)
  hasFocus.value = true
}

function handleTouchEnd() {
  hasFocus.value = false

  if (!views.value) {
    return
  }

  lastKnownOffsetX.value = views.value.style.transform
    ? translationToVector(views.value.style.transform).x * -1
    : 0

  currentOffsetX.value = lastKnownOffsetX.value
}

function updateOffset(offset: number) {
  if (!views.value) {
    return
  }

  views.value.style.transform = `translate3d(${offset * -1}px, 0, 0)`
}

function updateIndicators(offsetX: number) {
  if (!views.value) {
    return
  }

  const total = views.value.scrollWidth

  viewIndex.value = Math.round((offsetX / total) * viewCount.value)
}

function updateAnimationClasses() {
  if (!views.value) {
    return
  }

  views.value.classList.add('animated')

  clearTimeout(animationTimeout.value)

  animationTimeout.value = setTimeout(() => {
    if (!views.value) {
      return
    }

    views.value.classList.remove('animated')
  }, 200)
}

function updateViewCount() {
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
</script>

<template>
  <div>
    <div
      class="overflow-x-hidden hide-scrollbar"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchmove="handleTouchMove"
    >
      <div ref="views" class="flex md:grid grid-cols-12 gap-6 views">
        <slot></slot>
      </div>
    </div>
    <div class="flex gap-2 justify-center mt-4 md:hidden">
      <AppHorizontalScrollViewIndicator
        v-for="index in viewCount"
        :key="`horizontal-scroll-view-indicator-${index}`"
        :active="viewIndex === index - 1"
        @click="handleScrollToIndex(index - 1)"
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
