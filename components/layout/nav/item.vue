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
import { BigNumberInBase } from '@injectivelabs/utils'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { Identify, identify } from '@amplitude/analytics-browser'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { AmplitudeEvents, TradeClickOrigin } from '~/types'
import { AMPLITUDE_VIP_TIER_LEVEL } from '~/app/utils/vendor'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    },

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
      const identifyObj = new Identify()
      identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, this.tierLevel)
      identify(identifyObj)

      this.$amplitude.track(AmplitudeEvents.TradeClicked, {
        market: this.spotMarket ? this.spotMarket : this.perpetualMarket,
        marketType: this.spotMarket ? MarketType.Spot : MarketType.Perpetual,
        origin: TradeClickOrigin.TopMenu
      })
    }
  }
})
</script>
