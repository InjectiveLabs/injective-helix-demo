<template>
  <div v-show="isOpen" class="fixed z-1100 inset-0 overflow-y-auto py-4">
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0"
    >
      <transition
        enter-active-class="ease-out duration-300"
        enter-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="isOpen"
          class="fixed inset-0 transition-opacity"
          :aria-hidden="isOpen"
          @click="handleCloseModal"
        >
          <div class="absolute inset-0 bg-gray-700 opacity-90" />
        </div>
      </transition>

      <transition
        enter-active-class="ease-out duration-300"
        enter-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="ease-in duration-200"
        leave-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="inline-block align-bottom bg-gray-850 shadow-card rounded-2xl p-8 text-left transform transition-all w-full max-w-lg sm:max-w-lg lg:max-w-3xl"
          role="dialog"
          :aria-modal="isOpen"
          aria-labelledby="modal-headline"
        >
          <div>
            <div class="block w-full">
              <div class="flex items-center justify-between">
                <div
                  class="text-xs uppercase text-gray-100 tracking-wider font-semibold"
                >
                  <slot name="title" />
                </div>
                <button
                  type="button"
                  class="bg-transparent rounded-md text-gray-200 hover:text-primary-500"
                  @click="handleClickOnCloseButton"
                >
                  <span class="sr-only">{{ $t('close') }}</span>
                  <v-icon-close class="w-4 h-4" />
                </button>
              </div>
            </div>
            <slot name="header" />
            <div class="mt-12">
              <slot />
            </div>
            <slot name="footer" />
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
    }
  },

  watch: {
    isOpen(newIsOpen: boolean) {
      if (newIsOpen) {
        document.body.classList.add('overflow-hidden')
      } else {
        document.body.classList.remove('overflow-hidden')
      }
    }
  },

  mounted() {
    this.onEscKeyDown()
  },

  methods: {
    handleCloseModal() {
      if (this.isOpen) {
        this.$emit('modal-closed')
      }
    },

    handleClickOnCloseButton() {
      this.handleCloseModal()
    },

    onEscKeyDown() {
      const onEscape = (e: KeyboardEvent) => {
        if (this.isOpen && e.keyCode === 27) {
          this.handleCloseModal()
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
