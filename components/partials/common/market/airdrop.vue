<template>
  <a v-if="showPromotion" :href="url" target="_blank">
    <div
      class="rounded bg-orange-300 h-5 pl-3 pr-1 cursor-pointer flex items-center"
    >
      <span class="text-white text-3xs font-semibold uppercase">
        {{ $t('markets.airdrop') }}
      </span>
    </div>
  </a>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { isWithinInterval } from 'date-fns'
import { marketPromotions } from '~/app/data/market'
import { MarketPromotion } from '~/types'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    }
  },

  computed: {
    promotion(): MarketPromotion | undefined {
      const { market } = this

      return marketPromotions.find(
        (promotion) => promotion.market === market.slug
      )
    },

    showPromotion(): boolean {
      const { market, promotion } = this

      if (!market || !promotion) {
        return false
      }

      return isWithinInterval(Date.now(), {
        start: promotion.start,
        end: promotion.end
      })
    },

    url(): string {
      const { promotion } = this

      if (!promotion) {
        return ''
      }

      return promotion.url
    }
  }
})
</script>
