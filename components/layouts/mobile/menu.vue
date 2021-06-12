<template>
  <div class="ml-4 block lg:hidden relative pt-4">
    <button
      :class="isMenuOpen ? 'is-active' : ''"
      class="
        hamburger hamburger--spin
        outline-none
        focus:outline-none
        block
        lg:hidden
      "
      type="button"
      @click.stop="toggleMenu"
    >
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    </button>

    <div
      v-on-clickaway="closeMenu"
      :class="isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'"
      class="
        absolute
        flex
        justify-center
        border
        flex-wrap
        top-0
        left-0
        mr-0
        min-w-2xs
        -ml-4
        right-0
        mt-12
        rounded rounded-tl-none
        bg-dark-700
        shadow-md
      "
    >
      <div class="flex w-full flex-wrap h-full border">
        <div class="w-full hover:bg-dark-800 p-2 border-b">
          <v-drawer>
            <span slot="header" class="cursor-pointer px-2 text-gray-200">
              {{ $t('spot_markets') }}
            </span>
            <div class="text-xs py-1">
              <v-spot />
            </div>
          </v-drawer>
        </div>
        <div class="flex w-full flex-wrap h-full border">
          <div class="w-full hover:bg-dark-800 p-2 border-b">
            <v-drawer>
              <span slot="header" class="cursor-pointer px-2 text-gray-200">
                {{ $t('derivatives') }}
              </span>
              <div class="text-xs py-1">
                <v-derivatives />
              </div>
            </v-drawer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { directive as onClickaway } from 'vue-clickaway'
import VSpot from '~/components/partials/spot/markets/index-mobile.vue'
import VDerivatives from '~/components/partials/derivatives/markets/index-mobile.vue'
import Drawer from '~/components/elements/drawer.vue'

export default Vue.extend({
  components: {
    'v-drawer': Drawer,
    VSpot,
    VDerivatives
  },

  directives: {
    onClickaway
  },

  data() {
    return {
      isMenuOpen: false
    }
  },

  methods: {
    closeMenu() {
      if (this.isMenuOpen) {
        this.isMenuOpen = false
      }
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  }
})
</script>
