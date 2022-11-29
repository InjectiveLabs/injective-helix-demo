<template>
  <div
    v-show="isVisibleOnViewport"
    class="fixed z-1100 inset-0 overflow-y-auto"
  >
    <div
      class="flex items-center justify-center min-h-screen text-center sm:p-0"
      :class="{ 'pt-4 px-4 pb-20': !mobileOnly }"
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
          class="fixed inset-0 transition-all"
          :aria-hidden="isOpen"
          @click="handleCloseModal"
        >
          <div
            class="absolute inset-0 backdrop-filter"
            :class="
              hasBlurBg
                ? 'backdrop-blur bg-gray-900 bg-opacity-60'
                : 'backdrop-blur-sm bg-gray-900 bg-opacity-80'
            "
          />
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
          v-show="isOpen"
          class="inline-block align-bottom bg-gray-950 shadow-none rounded-lg text-left transform transition-all w-full h-full"
          :class="classes"
          role="dialog"
          :aria-modal="isOpen"
          aria-labelledby="modal-headline"
        >
          <div class="mb-6 px-6 pt-6">
            <slot name="header">
              <div class="block w-full">
                <div class="flex items-center justify-between">
                  <div
                    class="text-sm uppercase text-white font-semibold flex-grow"
                  >
                    <slot name="title" />
                  </div>
                  <button
                    v-if="showCloseButton"
                    type="button"
                    class="bg-transparent rounded-md text-gray-200 hover:text-primary-500"
                    data-cy="reusable-modal-close-button"
                    @click="handleClickOnCloseButton"
                  >
                    <span class="sr-only">{{ $t('common.close') }}</span>
                    <IconClose class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </slot>
          </div>

          <div :class="{ 'px-6': !noPadding, 'pb-6': !hasFooter }">
            <slot />
          </div>

          <div v-if="hasFooter" class="px-6 pb-6">
            <slot name="footer" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { debounce } from 'lodash'

export default Vue.extend({
  props: {
    isAlwaysOpen: {
      required: false,
      default: false,
      type: Boolean
    },

    hideCloseButton: {
      required: false,
      default: false,
      type: Boolean
    },

    hasBlurBg: {
      required: false,
      default: false,
      type: Boolean
    },

    isOpen: {
      required: true,
      default: false,
      type: Boolean
    },

    mobileOnly: {
      type: Boolean,
      default: false
    },

    sm: {
      type: Boolean,
      default: false
    },

    md: {
      type: Boolean,
      default: false
    },

    lg: {
      type: Boolean,
      default: false
    },

    noPadding: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      viewport: 0,
      isVisibleOnViewport: false
    }
  },

  computed: {
    classes(): string {
      const { sm, md, lg, mobileOnly } = this
      const classes = []

      if (mobileOnly) {
        return 'py-6 px-4 min-h-screen flex-grow flex flex-col'
      }

      if (sm) {
        classes.push('max-w-md')
      } else if (md) {
        classes.push('max-w-lg', 'lg:max-w-2xl')
      } else if (lg) {
        classes.push('max-w-lg', 'lg:max-w-3xl')
      } else {
        classes.push('max-w-lg', 'lg:max-w-4xl')
      }

      return classes.join(' ')
    },

    hasFooter() {
      return !!this.$slots.footer
    },

    showCloseButton(): boolean {
      const { isAlwaysOpen, hideCloseButton } = this

      return isAlwaysOpen || !hideCloseButton
    }
  },

  watch: {
    isOpen(newIsOpen: boolean) {
      newIsOpen ? this.handleOnOpen() : this.handleOnClose()
    }
  },

  mounted() {
    this.$nextTick(() => this.handleCloseOnResize())
    this.onEscKeyDown()
    window.addEventListener('resize', debounce(this.handleCloseOnResize, 100))

    if (this.isOpen) {
      this.handleOnOpen()
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleCloseOnResize)
    document.body.classList.remove('overflow-hidden')
  },

  methods: {
    handleOnOpen() {
      this.isVisibleOnViewport = true
      this.$nextTick(() => {
        document.body.classList.add('overflow-hidden')
      })
    },

    handleOnClose() {
      document.body.classList.remove('overflow-hidden')
      setTimeout(() => {
        this.isVisibleOnViewport = false
        this.$emit('modal-closed:animation')
        this.$accessor.modal.clearData()
      }, 300)
    },

    handleCloseModal() {
      if (this.isOpen && !this.isAlwaysOpen) {
        this.$emit('modal-closed')
      }
    },

    handleCloseOnResize() {
      this.viewport = window.innerWidth
      if (this.viewport >= 640 && this.mobileOnly) {
        this.handleCloseModal()
      }
    },

    handleClickOnCloseButton() {
      this.handleCloseModal()
    },

    onEscKeyDown() {
      if (this.isAlwaysOpen) {
        return
      }

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
