<template>
  <div
    v-show="isVisibleOnViewport"
    class="fixed inset-0 overflow-y-auto py-4"
    :class="{
      'mt-12 z-1000': showHeader,
      'z-1100': !showHeader
    }"
  >
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0"
    >
      <transition
        enter-active-class="ease-in-out duration-200"
        enter-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in-out duration-200"
        leave-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="isOpen"
          class="fixed inset-0 transition-opacity"
          :aria-hidden="isOpen"
          @click="handleCloseSlideout"
        >
          <div
            class="absolute inset-0 bg-gray-900 opacity-90 backdrop-filter backdrop-blur-sm"
          />
        </div>
      </transition>

      <transition
        enter-active-class="transform transition ease-in-out duration-300"
        enter-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-show="isOpen"
          class="fixed inset-y-0 left-0 pr-10 max-w-full flex transition-transform"
          :class="{ 'mt-12': showHeader }"
          role="dialog"
          :aria-modal="isOpen"
          aria-labelledby="modal-headline"
        >
          <div
            v-touch:swipe.left="handleCloseSlideout"
            class="w-screen max-w-xl"
          >
            <div
              class="h-full flex flex-col py-6 bg-gray-800 shadow-xl overflow-y-auto"
            >
              <div v-if="$slots['title']" class="px-4 sm:px-6">
                <div class="flex items-start justify-between">
                  <h2 class="text-lg font-medium text-gray-300">
                    <slot name="title" />
                  </h2>
                  <div class="ml-3 h-4 flex items-center">
                    <button
                      type="button"
                      class="bg-transparent rounded-md text-gray-300 hover:text-primary-500"
                      @click="handleClickOnCloseButton"
                    >
                      <span class="sr-only">{{ $t('close') }}</span>
                      <v-icon-close class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div
                class="relative flex-1 px-4 sm:px-6"
                :class="{ 'mt-6': $slots['title'] }"
              >
                <slot />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    isOpen: {
      required: true,
      default: false,
      type: Boolean
    },

    showHeader: {
      required: true,
      default: false,
      type: Boolean
    }
  },

  data() {
    return {
      isVisibleOnViewport: false
    }
  },

  watch: {
    isOpen(newIsOpen: boolean) {
      if (newIsOpen) {
        this.isVisibleOnViewport = true
        this.$nextTick(() => {
          document.body.classList.add('overflow-hidden')
        })
      } else {
        document.body.classList.remove('overflow-hidden')
        setTimeout(() => {
          this.isVisibleOnViewport = false
        }, 300)
      }
    },

    $route(to, from) {
      this.handleCloseSlideout()
    }
  },

  mounted() {
    this.onEscKeyDown()
  },

  beforeDestroy() {
    document.body.classList.remove('overflow-hidden')
  },

  methods: {
    handleCloseSlideout() {
      if (this.isOpen) {
        this.$emit('slideout-closed')
      }
    },

    handleClickOnCloseButton() {
      this.handleCloseSlideout()
    },

    onEscKeyDown() {
      const onEscape = (e: KeyboardEvent) => {
        if (this.isOpen && e.keyCode === 27) {
          this.handleCloseSlideout()
        }
      }

      document.addEventListener('keydown', onEscape)

      this.$once('hook:destroyed', () => {
        document.removeEventListener('keydown', onEscape)
      })
    }
  }
})
</script>
