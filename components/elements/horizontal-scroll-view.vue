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
      <HorizontalScrollViewIndicator
        v-for="index in viewCount"
        :key="`horizontal-scroll-view-indicator-${index}`"
        :active="viewIndex === index - 1"
        @click="handleScrollToIndex(index - 1)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HorizontalScrollViewIndicator from './horizontal-scroll-view-indicator.vue'

interface Vector {
  x: number
  y: number
  z: number
}

export default Vue.extend({
  components: {
    HorizontalScrollViewIndicator
  },

  data() {
    return {
      viewCount: 0,
      viewIndex: 0,
      hasFocus: false,
      lastKnownOffsetX: 0,
      currentOffsetX: 0,
      touchStartX: 0,
      animationTimeout: undefined as any
    }
  },

  mounted() {
    window.addEventListener('wheel', this.handleScroll)
    window.addEventListener('resize', this.handleResize)

    this.$nextTick(this.updateViewCount)
  },

  beforeDestroy() {
    window.removeEventListener('wheel', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize(): void {
      this.updateViewCount()
    },

    handleScroll(e: WheelEvent): void {
      if (this.hasFocus) {
        const views = this.$refs.views as HTMLElement
        const total = views.scrollWidth - views.clientWidth
        const deltaX = e.deltaX

        let newOffsetX = this.currentOffsetX - deltaX
        newOffsetX = Math.max(newOffsetX, 0)
        newOffsetX = Math.min(newOffsetX, total)

        this.currentOffsetX = newOffsetX

        this.updateOffset(newOffsetX)
        this.updateIndicators(newOffsetX)
      }
    },

    handleTouchMove(e: TouchEvent): void {
      e.preventDefault()
      if (this.hasFocus) {
        const views = this.$refs.views as HTMLElement
        const startX = this.touchStartX
        const currentX = this.getTouchPositionX(e)
        const offsetX = currentX - startX
        const total = views.scrollWidth - views.clientWidth
        const newOffsetX = this.clamp(this.currentOffsetX - offsetX, 0, total)

        this.updateOffset(newOffsetX)
        this.updateIndicators(newOffsetX)
      }
    },

    handleScrollToIndex(index: number): void {
      const views = this.$refs.views as HTMLElement
      const total = views.scrollWidth
      const totalViewWidth = views.clientWidth * this.viewCount
      const totalPadding = total - totalViewWidth
      const padding = totalPadding / (this.viewCount - 1)
      const newOffsetX = views.clientWidth * index + padding * index

      this.updateAnimationClasses()

      this.currentOffsetX = newOffsetX
      this.lastKnownOffsetX = newOffsetX

      this.updateOffset(newOffsetX)
      this.updateIndicators(newOffsetX)
    },

    handleMouseEnter(): void {
      this.currentOffsetX = this.lastKnownOffsetX
      this.hasFocus = true
    },

    handleMouseLeave(): void {
      this.hasFocus = false
      this.lastKnownOffsetX = this.currentOffsetX
    },

    handleTouchStart(e: TouchEvent): void {
      this.currentOffsetX = this.lastKnownOffsetX
      this.touchStartX = this.getTouchPositionX(e)
      this.hasFocus = true
    },

    handleTouchEnd(): void {
      this.hasFocus = false

      const views = this.$refs.views as HTMLElement
      this.lastKnownOffsetX = views.style.transform
        ? this.translationToVector(views.style.transform).x * -1
        : 0

      this.currentOffsetX = this.lastKnownOffsetX
    },

    updateOffset(offset: number) {
      const views = this.$refs.views as HTMLElement

      views.style.transform = `translate3d(${offset * -1}px, 0, 0)`
    },

    updateIndicators(offsetX: number) {
      const { viewCount } = this
      const views = this.$refs.views as HTMLElement
      const total = views.scrollWidth

      this.viewIndex = Math.round((offsetX / total) * viewCount)
    },

    updateAnimationClasses() {
      const views = this.$refs.views as HTMLElement

      views.classList.add('animated')

      clearTimeout(this.animationTimeout)

      this.animationTimeout = setTimeout(() => {
        views.classList.remove('animated')
      }, 200)
    },

    updateViewCount() {
      const views = this.$refs.views as HTMLElement

      this.viewCount = views.children.length
    },

    translationToVector(translation: string): Vector {
      const values = translation
        .split(/\w+\(|\);?/gim)[1]
        .split(/,\s?/g)
        .map(parseFloat)

      const x = values[0] || 0
      const y = values[1] || 0
      const z = values[2] || 0

      return { x, y, z }
    },

    getTouchPositionX(e: TouchEvent): number {
      const touch = e.touches[0] || e.changedTouches[0]

      return touch.pageX
    },

    clamp(val: number, min: number, max: number) {
      return Math.min(Math.max(val, min), max)
    }
  }
})
</script>

<style lang="scss" scoped>
.views {
  transform: translate3d(0, 0, 0);
  transform-origin: top left;
  will-change: transform;

  &.animated {
    transition: transform 200ms ease-in-out;
  }
}
</style>
