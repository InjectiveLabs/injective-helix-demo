<template>
  <nuxt-link
    v-bind="$attrs"
    class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex items-center"
    :class="classes"
    exact
    @click.native="handleClickEvent"
  >
    <span class="block">
      <slot></slot>
    </span>
  </nuxt-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { DefaultMarket, TradeClickOrigin } from '~/types'
import { amplitudeTracker } from '~/app/providers/AmplitudeTracker'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string[] {
      const { dense } = this

      if (dense) {
        return ['hover:text-primary-500']
      }

      return ['px-6', 'py-2', 'hover:bg-gray-800', 'hover:text-white']
    },

    spotMarket(): string {
      const { $attrs } = this

      type Attrs = { to: { params: { spot: string } } }

      const attrs = $attrs as unknown as Attrs

      if (!attrs || !attrs.to || !attrs.to.params) {
        return ''
      }

      return attrs.to.params.spot
    },

    perpetualMarket(): string {
      const { $attrs } = this

      type Attrs = { to: { params: { perpetual: string } } }

      const attrs = $attrs as unknown as Attrs

      if (!attrs || !attrs.to || !attrs.to.params) {
        return ''
      }

      return attrs.to.params.perpetual
    },

    market(): DefaultMarket {
      const { spotMarket } = this

      return spotMarket ? DefaultMarket.Spot : DefaultMarket.Perpetual
    },

    marketType(): MarketType {
      const { spotMarket } = this

      return spotMarket ? MarketType.Spot : MarketType.Perpetual
    }
  },

  methods: {
    handleClickEvent() {
      if (this.spotMarket || this.perpetualMarket) {
        this.handleTradeClickedTrack()
      }

      this.$root.$emit('nav-link-clicked')
    },

    handleTradeClickedTrack() {
      amplitudeTracker.submitTradeClickedTrackEvent({
        market: this.market,
        marketType: this.marketType,
        origin: TradeClickOrigin.TopMenu
      })
    }
  }
})
</script>
