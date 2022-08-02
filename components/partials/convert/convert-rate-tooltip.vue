<template>
  <div
    id="rate-tooltip"
    class="flex"
    @mouseenter="handleShowRateTooltip"
    @mouseleave="handleHideRateTooltip"
    @focus="handleShowRateTooltip"
    @blur="handleHideRateTooltip"
  >
    <slot></slot>
    <!-- Todo: Temporarily disabled until Helix Convert design finalizes. -->
    <!-- <PopperBox
      ref="rate-tooltip"
      hide-arrow
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-[286px] p-4 bg-helixGray-800 border border-helixGray-900 shadow"
      :options="popperOptions"
      binding-element="#rate-tooltip"
    >
      <div>
        <div class="flex items-center justify-start gap-1">
          <IconInfo />
          <span class="text-sm">How does the exchange work?</span>
        </div>
        <p class="mb-5 mt-2 text-xs">lorem ipsum dolor amet</p>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-start gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full" />
            <span class="text-xs">Good - xx % range with market rate</span>
          </div>
          <div class="flex items-center justify-start gap-2">
            <div class="w-2 h-2 bg-yellow-500 rounded-full" />
            <span class="text-xs">Fair - xx % range with market rate</span>
          </div>
          <div class="flex items-center justify-start gap-2">
            <div class="w-2 h-2 bg-red-500 rounded-full" />
            <span class="text-xs">Poor - low liquidity, xx % range with market rate</span>
          </div>
        </div>
      </div>
    </PopperBox> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import PopperBox from '~/components/elements/popper-box.vue'

enum RateQuality {
  Good = 'good',
  Fair = 'fair',
  Poor = 'poor'
}

export default Vue.extend({
  name: 'RateTooltip',

  components: {
    // PopperBox
  },

  computed: {
    $popper(): any {
      return this.$refs['rate-tooltip']
    },

    popperOptions(): any {
      return {
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 12]
            }
          }
        ]
      }
    },

    rateQuality(): RateQuality {
      // TODO: This value will come from a calculation based on props, for now we just return a static value.
      return RateQuality.Fair
    },

    rateClass(): Object {
      const { rateQuality } = this

      return {
        'text-green-500': rateQuality === RateQuality.Good,
        'text-yellow-500': rateQuality === RateQuality.Fair,
        'text-red-500': rateQuality === RateQuality.Poor
      }
    }
  },

  methods: {
    handleShowRateTooltip() {
      if (this.$popper) {
        this.$popper.showDropdown()
      }
    },

    handleHideRateTooltip() {
      if (this.$popper) {
        this.$popper.hideDropdown()
      }
    }
  }
})
</script>
