<template>
  <div>
    <div
      id="popper-trade"
      class="text-gray-200 items-center tracking-widest uppercase text-xs rounded cursor-pointer mx-px block px-6 py-2 hover:bg-gray-800 hover:text-white"
      @mouseenter="handleShowTradeDropdown"
      @mouseleave="handleHideTradeDropdown"
      @focus="handleShowTradeDropdown"
      @blur="handleHideTradeDropdown"
    >
      <span class="block">
        {{ $t('navigation.trade') }}
      </span>
    </div>
    <VPopperBox
      ref="popper-trade"
      class="popper bg-gray-800 rounded flex flex-col flex-wrap absolute z-10 shadow-md max-w-sm"
      binding-element="#popper-trade"
      :options="popperOption"
    >
      <div>
        <nuxt-link
          :to="{
            name: 'swap-swap',
            query: { from: 'inj', to: 'usdt' }
          }"
        >
          <div class="group flex justify-between p-6 items-end">
            <div>
              <div class="text-gray-200 group-hover:text-primary-500 text-xs uppercase tracking-widest mb-4">
                {{ $t('navigation.swap') }}
              </div>
              <div class="text-gray-500 text-sm">
                {{ $t('navigation.swapDescription') }}
              </div>
            </div>
            <div class="bg-gray-900 rounded-full p-4 ml-6">
              <v-icon-swap class="w-6 h-6 group-hover:text-primary-500" />
            </div>
          </div>
        </nuxt-link>
        <hr class="mx-6" />
        <nuxt-link
          :to="{
            name: 'derivatives-derivative',
            params: { derivative: 'btc-usdt-perp' }
          }"
        >
          <div class="group flex justify-between p-6 items-end">
            <div>
              <div class="text-gray-200 group-hover:text-primary-500 text-xs uppercase tracking-widest mb-4">
                {{ $t('navigation.pro') }}
              </div>
              <div class="text-gray-500 text-sm">
                {{ $t('navigation.proDescription') }}
              </div>
            </div>
            <div class="bg-gray-900 rounded-full p-4 ml-6">
              <v-icon-dashboard class="w-6 h-6 group-hover:text-primary-500" />
            </div>
          </div>
        </nuxt-link>
      </div>
    </VPopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VPopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    VPopperBox
  },

  data() {
    return {
      isTradeDropdownOpen: false,
      popperOption: {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    }
  },

  computed: {
    $popper(): any {
      return this.$refs['popper-trade']
    }
  },

  watch: {
    $route() {
      this.handleHideTradeDropdown()
    }
  },

  methods: {
    handleShowTradeDropdown() {
      if (this.$popper) {
        this.$popper.showDropdown()
      }

      this.isTradeDropdownOpen = true
    },

    handleHideTradeDropdown() {
      if (this.$popper) {
        this.$popper.hideDropdown()
      }

      this.isTradeDropdownOpen = false
    }
  }
})
</script>
