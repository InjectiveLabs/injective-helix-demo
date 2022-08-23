<template>
  <div>
    <div
      v-on-clickAway="onDropdownClose"
      class="relative inline-block text-left w-full"
    >
      <div
        :class="wrapperClass"
        class="rounded bg-transparent p-2 pr-3"
      >
        <button
          type="button"
          class="inline-flex tracking-widest items-center justify-between w-full uppercase outline-none focus:outline-none"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
          @click="onDropdownToggle"
        >
          <slot name="title" />
          <IconCaretDown class="h-auto w-3 transform rotate-180 ml-2" />
        </button>
      </div>

      <transition
        enter-active-class="transition ease-out duration-100"
        enter-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="isDropdownOpen"
          class="origin-bottom-right absolute left-0 bottom-0 w-full shadow-md divide-y z-20 overflow-hidden rounded-lg"
          :class="menuClass"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
          @click="handleClick"
        >
          <slot />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { directive as onClickAway } from 'vue-clickaway'

export default Vue.extend({
  directives: {
    onClickAway
  },

  props: {
    menuClass: {
      type: String,
      default: ''
    },

    wrapperClass: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isDropdownOpen: false
    }
  },

  mounted() {
    this.onDropdownEscClose()
  },

  methods: {
    onDropdownEscClose() {
      const onEscape = (e: KeyboardEvent) => {
        if (this.isDropdownOpen && e.keyCode === 27) {
          this.onDropdownClose()
        }
      }

      document.addEventListener('keydown', onEscape)

      this.$once('hook:destroyed', () => {
        document.removeEventListener('keydown', onEscape)
      })
    },

    handleClick() {
      this.onDropdownClose()
    },

    onDropdownClose() {
      if (this.isDropdownOpen) {
        this.isDropdownOpen = false
      }
    },

    onDropdownToggle() {
      this.isDropdownOpen = !this.isDropdownOpen
    }
  }
})
</script>
