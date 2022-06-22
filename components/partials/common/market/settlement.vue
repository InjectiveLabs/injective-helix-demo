<template>
  <MarketInfo
    v-if="market"
    :title="$t('trade.binaryOptions.settlement')"
    :tooltip="$t('trade.binaryOptions.settlement_tooltip')"
  >
    Settlement
  </MarketInfo>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiBinaryOptionsMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketInfo from '~/components/elements/market-info.vue'

export default Vue.extend({
  components: {
    MarketInfo
  },

  data() {
    return {
      //
    }
  },

  computed: {
    market(): UiBinaryOptionsMarketWithToken | undefined {
      return this.$accessor.derivatives.market as
        | UiBinaryOptionsMarketWithToken
        | undefined
    }
  },

  beforeDestroy() {}
})
</script>
