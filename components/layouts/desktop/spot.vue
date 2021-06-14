<template>
  <div class="header-nav relative">
    <div
      :class="isDropdownOpen ? 'is-active' : ''"
      class="w-full h-full py-2 flex px-6 items-center cursor-pointer group"
      @click="toggleDropdown"
    >
      <span
        class="
          mr-2
          uppercase
          tracking-wider
          text-xs
          flex
          items-center
          select-none
        "
      >
        <span class="text-gray-300 group-hover:text-gray-200 font-semibold">
          {{ $t('spot') }}
        </span>
      </span>
      <v-ui-icon
        :icon="Icon.Dropdown"
        xs
        class="text-gray-500 group-hover:text-gray-300"
      />
    </div>
    <transition name="fade">
      <div
        v-if="isDropdownOpen"
        v-on-clickaway="closeDropdown"
        class="
          absolute
          -mx-px
          flex
          justify-center
          border
          max-h-xs
          flex-wrap
          top-0
          left-0
          min-w-2xl
          mt-12
          rounded rounded-tl-none
          bg-dark-700
          shadow-md
          overflow-y-auto
        "
      >
        <v-spot @selected="closeDropdown" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { directive as onClickaway } from 'vue-clickaway'
import VSpot from '~/components/partials/spot/markets/index.vue'
import { Icon } from '~/types'

export default Vue.extend({
  directives: {
    onClickaway
  },

  components: {
    VSpot
  },

  data() {
    return {
      Icon,
      isDropdownOpen: false
    }
  },

  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
    },

    closeDropdown() {
      if (this.isDropdownOpen) {
        this.isDropdownOpen = false
      }
    }
  }
})
</script>
