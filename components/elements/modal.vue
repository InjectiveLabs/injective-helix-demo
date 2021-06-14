<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex flex-col items-center pt-24 lg:pt-32 z-40"
  >
    <transition v-if="close" name="fade" appear>
      <div
        class="absolute inset-0 bg-dark-600 opacity-75"
        @click="onClose"
      ></div>
    </transition>

    <transition name="fade-shrink-in" appear>
      <div
        class="
          relative
          w-5/6
          md:w-auto
          max-h-modal
          shadow-inner
          bg-dark-800
          border
          max-w-5xl
          mx-auto
          rounded
          z-20
        "
      >
        <div class="absolute right-0 top-0 -mt-4 -mr-4">
          <button
            v-if="close"
            type="button"
            class="
              w-10
              h-10
              align-middle
              rounded-full
              border
              shadow-md
              bg-dark-800
              text-gray-300 text-2xl
              leading-none
              hover-scale
              outline-none
              focus:outline-none
            "
            @click.stop="onClose"
          >
            &times;
          </button>
        </div>
        <slot class="overflow-y-auto"></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    isOpen: {
      required: true,
      type: Boolean
    },

    close: {
      required: false,
      default: true,
      type: Boolean
    }
  },

  /**
   * We close the modal on ESC
   */
  mounted() {
    const onEscape = (e: KeyboardEvent) => {
      if (this.isOpen && this.close && e.keyCode === 27) {
        this.onClose()
      }
    }

    document.addEventListener('keydown', onEscape)

    this.$once('hook:destroyed', () => {
      document.removeEventListener('keydown', onEscape)
    })
  },

  methods: {
    onClose() {
      this.$emit('closed')
    }
  }
})
</script>
