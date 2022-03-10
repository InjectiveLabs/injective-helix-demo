<template>
  <div v-if="isSidebarOpen" class="lg:hidden">
    <div v-touch:swipe.left="onSidebarClose" class="fixed inset-0 flex z-1110">
      <transition
        enter-active-class="transition-opacity ease-linear duration-300"
        enter-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-linear duration-300"
        leave-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSidebarOpen"
          class="fixed inset-0"
          aria-hidden="true"
          @click="onSidebarClose"
        >
          <div class="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>
      </transition>
      <transition
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="isSidebarOpen"
          class="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-black"
        >
          <div class="absolute top-0 right-0 mr-2 pt-2">
            <button
              v-if="isSidebarOpen"
              class="ml-1 flex items-center justify-center h-10 w-10 rounded-full"
              @click="onSidebarClose"
            >
              <span class="sr-only">{{ $t('common.close') }}</span>
              <v-icon-close class="w-6 h-6 text-gray-200" />
            </button>
          </div>

          <v-sidebar-content />
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
    'v-sidebar-content': SidebarContent
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
