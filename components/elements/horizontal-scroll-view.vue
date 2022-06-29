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
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HorizontalScrollViewIndicator from './horizontal-scroll-view-indicator.vue'

export default Vue.extend({
  components: {
    HorizontalScrollViewIndicator
  },

  data() {
    return {
      viewCount: 0,
      viewIndex: 0
    }
  },

  mounted() {
    const viewsElement = this.$refs.views as HTMLElement

    if (viewsElement) {
      this.viewCount = viewsElement.children.length
    }
  },

  methods: {
    handleScroll(e: Event) {
      const target = e.target as HTMLElement
      const offset = target.scrollLeft
      const viewWidth = target.clientWidth
      const total = target.scrollWidth - viewWidth

      this.viewIndex = Math.round((offset / total) * 2)
    }
  }
})
</script>
