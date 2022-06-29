<template>
  <MarketInfo
    v-if="market"
    :title="$t('trade.binaryOptions.settlement')"
    :tooltip="$t('trade.binaryOptions.settlement_tooltip')"
  >
    {{ expiredAt }}
  </MarketInfo>
</template>

<script lang="ts">
import Vue from 'vue'
import { format } from 'date-fns'
import { UiBinaryOptionsMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketInfo from '~/components/elements/market-info.vue'
import { DMM_TIME_STAMP_FORMAT } from '~/app/utils/constants'

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
    },

    expiredAt(): string | undefined {
      const { market } = this

      if (!market) {
        return
      }

      return format(market.settlementTimestamp * 1000, DMM_TIME_STAMP_FORMAT)
    }
  },

  beforeDestroy() {}
})
</script>
