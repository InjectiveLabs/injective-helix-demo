<template>
  <div
    class="bg-helixGray-950 shadow-sm px-4 py-1 rounded-xl"
    data-cy="trading-page-market-info-component"
  >
    <div
      class="mt-1 py-2 lg:py-1 cursor-pointer grid grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5 items-center"
    >
      <div class="flex items-center w-auto justify-between lg:pr-5">
        <div class="flex items-center" @click="handleTokenClick">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-6 h-6 mr-4"
          />
          <div class="leading-none select-none">
            <p class="text-gray-100 font-semibold text-sm flex items-center">
              <span data-cy="trading-page-ticker-name-text-content">{{
                market.ticker
              }}</span>
              <IconChevron
                class="w-auto h-3 text-gray-500 ml-2 transform transition ease-in-out duration-300"
                :class="[expanded ? 'rotate-90' : '-rotate-90']"
              />
            </p>
            <p class="text-gray-500 text-xs">
              {{ market.baseToken.name }}
            </p>
          </div>
        </div>

        <div class="w-px h-8 border-r hidden lg:block" />

        <LastTradedPriceAndChange
          :market="market"
          :summary="summary"
          lg
          update-tab
        />
      </div>

      <MarketStats
        :market="market"
        :summary="summary"
        class="mt-4 lg:mt-0 flex-1 overflow-x-auto col-span-2 2xl:col-span-3"
      />

      <div class="ml-auto hidden lg:block">
        <button
          id="layout-preferences-button"
          class="w-4 h-4 cursor-pointer group"
          @click="handleToggleLayoutPreferences"
        >
          <IconSliders class="text-gray-450 group-hover:text-white" />
        </button>
      </div>
    </div>

    <PopperBox
      ref="layout-preferences-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-80 bg-gray-950 shadow-dropdown z-1000"
      :options="popperOptions"
      binding-element="#layout-preferences-button"
    >
      <LayoutPreferences />
    </PopperBox>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary
} from '@injectivelabs/sdk-ui-ts'
import MarketStats from './stats.vue'
import LastTradedPriceAndChange from './last-traded-price-and-change.vue'
import LayoutPreferences from './layout-preferences.vue'
import PopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    LastTradedPriceAndChange,
    MarketStats,
    LayoutPreferences,
    PopperBox
  },

  props: {
    market: {
      type: Object as PropType<UiDerivativeMarketWithToken>,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary | UiDerivativeMarketSummary>,
      required: true
    },

    expanded: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      popperActive: false
    }
  },

  computed: {
    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    },

    $popper(): any {
      return this.$refs['layout-preferences-dropdown']
    },

    popperOptions(): any {
      return {
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 22]
            }
          }
        ]
      }
    }
  },

  methods: {
    handleTokenClick() {
      this.$root.$emit('toggle-market-list')
    },

    handleToggleLayoutPreferences() {
      const fn = this.popperActive
        ? this.hideLayoutPreferences
        : this.showLayoutPreferences

      fn()
    },

    showLayoutPreferences() {
      if (this.$popper) {
        this.$popper.showDropdown()
        this.popperActive = true
      }
    },

    hideLayoutPreferences() {
      if (this.$popper) {
        this.$popper.hideDropdown()
        this.popperActive = false
      }
    }
  }
})
</script>
