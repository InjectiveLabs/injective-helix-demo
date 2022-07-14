<template>
  <v-item class="col-span-2 lg:col-span-4">
    <template slot="value">
      <span v-if="quoteDenoms" class="font-mono text-lg">
        {{ quoteDenoms }}
      </span>
      <span v-else>&mdash;</span>
    </template>
    <template slot="title">
      <div class="flex items-center justify-center">
        {{ $t('trade.quote_denoms') }}
        <IconInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.quote_denoms_tooltip')"
        />
      </div>
    </template>
  </v-item>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'
import VItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VItem
  },

  computed: {
    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    quoteDenoms(): string {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ''
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return ''
      }

      return tradingRewardsCampaign.tradingRewardCampaignInfo.quoteSymbolsList.join(
        ', '
      )
    }
  }
})
</script>
