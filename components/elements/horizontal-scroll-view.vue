<template>
  <div>
    <div
      ref="views"
      class="flex md:grid grid-cols-12 gap-6 overflow-x-auto hide-scrollbar"
      @scroll="handleScroll"
    >
      <slot></slot>
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
import { lerp, Easings } from '~/app/utils/animation'

const ANIMATION_DURATION_IN_SECONDS: number = 0.5

export default Vue.extend({
  components: {
    HorizontalScrollViewIndicator
  },

  data() {
    return {
      viewCount: 0,
      viewIndex: 0,
      currentOffset: 0,
      targetOffset: 0,
      hasReachedTargetOffset: true,
      start: performance.now(),
      rafHandle: undefined as any
    }
  },

  mounted() {
    window.addEventListener('resize', this.updateChildCount)
    this.updateChildCount()
    this.animate()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateChildCount)
  },

  methods: {
    handleScroll(e: Event): void {
      const target = e.target as HTMLElement
      const offset = target.scrollLeft
      const viewWidth = target.clientWidth
      const total = target.scrollWidth - viewWidth

      this.viewIndex = Math.round((offset / total) * 2)
    },

    handleScrollToIndex(index: number): void {
      const target = this.$refs.views as HTMLElement
      const viewWidth = target.clientWidth
      const total = target.scrollWidth - viewWidth

      this.currentOffset = target.scrollLeft
      this.targetOffset = (index / 2) * total

      this.animate()
    },

    animate(): void {
      this.start = performance.now()
      this.rafHandle = window.requestAnimationFrame(this.animationLoop)
    },

    animationLoop(now: number): void {
      const { currentOffset, targetOffset, start } = this

      const target = this.$refs.views as HTMLElement
      const deltaTime = (now - start) * 0.001
      const t = Math.min(deltaTime / ANIMATION_DURATION_IN_SECONDS, 1)

      target.scrollLeft = lerp(currentOffset, targetOffset, Easings.easeInOut(t))

      if (t < 1) {
        this.rafHandle = window.requestAnimationFrame(this.animationLoop)
      } else {
        window.cancelAnimationFrame(this.rafHandle)
      }
    },

    updateChildCount(): void {
      const viewsElement = this.$refs.views as HTMLElement

      if (viewsElement) {
        this.viewCount = viewsElement.children.length
      }
    }
  }
})
</script>
