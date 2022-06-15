<template>
  <nuxt-link :to="marketRoute">
    <TableRow lg class="cursor-pointer">
      <span class="text-base md:text-sm col-span-5">
        <div class="flex items-center cursor-pointer justify-start">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-4 h-4 md:w-6 md:h-6 mr-4"
          />
          <div class="mr-4 text-left">
            <div class="flex">
              {{ market.ticker }}
              <span
                v-if="isMarketBeta"
                primary
                xs
                class="ml-2 text-2xs uppercase text-primary-500"
              >
                {{ $t('marketBeta.beta') }}
              </span>
            </div>
            <span class="text-gray-500 text-xs hidden md:block">
              {{ market.baseToken.name }}
            </span>
          </div>
        </div>
      </span>
      <span class="text-center text-sm col-span-7">
        {{ $t('marketNew.soonToBeReleased') }}
      </span>
    </TableRow>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import TableRow from '~/components/elements/table-row.vue'
import { MarketRoute } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    condensed: {
      required: false,
      default: false,
      type: Boolean
    },

    market: {
      required: true,
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >
    },

    summary: {
      required: true,
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>
    }
  },

  computed: {
    isMarketBeta(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return betaMarketSlugs.includes(market.slug)
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  }
})
</script>
