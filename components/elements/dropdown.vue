<template>
  <div class="">
    <div
      v-on-clickaway="onDropdownClose"
      class="relative inline-block text-left w-full"
      :class="selectedClass"
    >
      <div>
        <button
          type="button"
          class="inline-flex tracking-widest items-center justify-between w-full py-1 text-xs uppercase outline-none focus:outline-none text-gray-500"
          :class="[selectorClass, { 'border-b': !hideBottomBorder }]"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
          @click="onDropdownToggle"
        >
          <slot name="title" />
          <v-icon-caret-down
            class="h-4 w-4"
            :class="[
              dark ? 'text-gray-500' : 'text-gray-200',
              tight ? 'ml-1' : '-mr-1 ml-3 '
            ]"
          />
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
          class="origin-top-right absolute left-0 top-0 w-full shadow-md divide-y divide-gray-100 z-20 bg-gray-800 divide-gray-500 overflow-hidden"
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
import { directive as onClickaway } from 'vue-clickaway'

export default Vue.extend({
  directives: {
    onClickaway
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    hideBottomBorder: {
      type: Boolean,
      default: false
    },

    menuClass: {
      type: String,
      default: ''
    },

    selectedClass: {
      type: String,
      default: ''
    },

    preventClose: {
      type: Boolean,
      default: false
    },

    round: {
      type: Boolean,
      default: false
    },

    dark: {
      type: Boolean,
      default: false
    },

    tight: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isDropdownOpen: false
    }
  },

  computed: {
    selectorClass(): string {
      const { round } = this

      if (!round) {
        return 'border-gray-600'
      }

      // text-gray-500 border-gray-600

      return 'bg-gray-900 rounded-full h-10 shadow-sm px-4 py-3' as string
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
      const { preventClose } = this

      // add support to prevent closing menu on click
      if (!preventClose) {
        this.onDropdownClose()
      }
    },

    onDropdownClose() {
      if (this.isDropdownOpen) {
        this.isDropdownOpen = false
      }
    },

    onDropdownToggle() {
      if (!this.disabled) {
        this.isDropdownOpen = !this.isDropdownOpen
      }
    }
  }
})
</script>
