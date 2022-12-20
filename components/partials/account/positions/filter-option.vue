<template>
  <div class="flex justify-start items-center gap-2">
    <img v-if="tokenLogo" :src="tokenLogo" class="w-4 h-4" />
    <span :class="labelClass">
      {{ label }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'

export default Vue.extend({
  props: {
    denom: {
      type: String,
      default: ''
    },

    label: {
      type: String,
      required: true
    },

    labelClass: {
      type: String,
      default: 'text-sm text-white'
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    tokenLogo(): string | undefined {
      const { markets, denom } = this

      if (denom === '') {
        return undefined
      }

      const market = markets.find(
        (market) =>
          market.baseToken.denom === denom || market.quoteToken.denom === denom
      )

      if (!market) {
        return undefined
      }

      const logo =
        market.quoteDenom === denom
          ? market.quoteToken.logo
          : market.baseToken.logo

      return getTokenLogoWithVendorPathPrefix(logo)
    }
  }
})
</script>
