<template>
  <div v-if="isSidebarOpen" class="lg:hidden">
    <div
      v-touch:swipe.left="onSidebarClose"
      class="fixed inset-0 flex z-1110 top-[48px]"
    >
      <transition
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div class="relative flex-1 flex flex-col w-full pt-5 pb-4 bg-gray-900">
          <SidebarContent />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SidebarContent from '~/components/layout/sidebar-content.vue'

export default Vue.extend({
  components: {
    SidebarContent
  },

  props: {
    isSidebarOpen: {
      required: true,
      default: false,
      type: Boolean
    }
  },

  mounted() {
    this.$root.$on('close-sidebar', this.onSidebarClose)
  },

  methods: {
    onSidebarClose() {
      const { isSidebarOpen } = this

      if (isSidebarOpen) {
        this.$emit('sidebar-closed')
      }
    }
  }
})
</script>
