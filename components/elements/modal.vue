<template>
  <div
    v-show="isVisibleOnViewport"
    class="fixed z-1100 inset-0 overflow-y-auto py-4"
  >
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
          class="inline-block align-bottom bg-gray-800 shadow-sm rounded-xl text-left transform transition-all w-full max-w-lg"
          :class="classes"
          role="dialog"
          :aria-modal="isOpen"
          aria-labelledby="modal-headline"
        >
          <div>
            <div class="block w-full">
              <div class="flex items-center justify-between">
                <div
                  class="text-xs uppercase text-gray-100 tracking-wider font-semibold grow"
                >
                  <slot name="title" />
                </div>
                <button
                  v-if="!isAlwaysOpen"
                  type="button"
                  class="bg-transparent rounded-md text-gray-200 hover:text-primary-500"
                  @click="handleClickOnCloseButton"
                >
                  <span class="sr-only">{{ $t('common.close') }}</span>
                  <v-icon-close class="w-4 h-4" />
                </button>
              </div>
            </div>
            <slot name="header" />
            <div :class="{ 'mt-6': !dense }">
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
    isAlwaysOpen: {
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

    dense: {
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
    }
  },

  data() {
    return {
      isVisibleOnViewport: false
    }
  },

  computed: {
    classes(): string {
      const { dense, sm, md, lg } = this
      const classes = []

      if (dense) {
        classes.push('p-8')
      } else {
        classes.push('p-6')
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
    }
  },

  watch: {
    isOpen(newIsOpen: boolean) {
      newIsOpen ? this.handleOnOpen() : this.handleOnClose()
    }
  },

  mounted() {
    this.onEscKeyDown()

    if (this.isOpen) {
      this.handleOnOpen()
    }
  },

  beforeDestroy() {
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
      }, 300)
    },

    handleCloseModal() {
      if (this.isOpen && !this.isAlwaysOpen) {
        this.$emit('modal-closed')
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
