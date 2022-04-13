<template>
  <VHocLoading :key="$route.fullPath" :status="status">
    <div
      v-if="market"
      class="flex flex-col flex-wrap min-h-screen-excluding-header"
    >
      <div class="w-full px-1">
        <v-component
          :is="isSpotMarket ? 'v-spot-market' : 'v-derivative-market'"
          :expanded="showMarketList"
        />
      </div>
      <div class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1">
        <div class="col-span-6 lg:col-span-3 4xl:col-span-3 overflow-y-hidden">
          <transition name="fade-up" mode="out-in">
            <v-market-selection v-if="showMarketList" />
            <div v-else class="flex flex-col flex-wrap h-full w-full">
              <slot name="trading-panel" />
            </div>
          </transition>
        </div>
        <div class="col-span-6 lg:col-span-9 4xl:col-span-9">
          <div class="flex flex-wrap flex-col w-full h-full">
            <div class="w-full">
              <v-card tight>
                <div class="grid grid-cols-6 lg:grid-cols-12">
                  <div class="col-span-6 lg:col-span-8 4xl:col-span-9">
                    <slot name="chart" />
                  </div>
                  <div class="col-span-6 lg:col-span-4 4xl:col-span-3">
                    <slot name="order-books" />
                  </div>
                </div>
              </v-card>
            </div>
            <div class="w-full flex-1 mt-1">
              <slot name="orders" />
            </div>
          </div>
        </div>
      </div>
      <slot name="modals" />
      <v-modal-market-beta v-if="marketIsBeta" />
    </div>
  </VHocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import VSpotMarket from '~/components/partials/spot/market.vue'
import VDerivativeMarket from '~/components/partials/derivatives/market.vue'
import VMarketSelection from '~/components/partials/common/markets/markets-selection.vue'
import VModalMarketBeta from '~/components/partials/modals/market-beta.vue'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '~/app/utils/constants'
import { betaMarketSlugs } from '~/app/data/market'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VDerivativeMarket,
    VMarketSelection,
    VModalMarketBeta,
    VSpotMarket
  },

  props: {
    overwriteSlug: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      isSpotMarket: false,
      showMarketList: false,
      interval: 0 as any
    }
  },

  computed: {
    derivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    spotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    market(): UiSpotMarketWithToken | UiDerivativeMarketWithToken | undefined {
      const { derivativeMarket, isSpotMarket, spotMarket } = this

      return isSpotMarket ? spotMarket : derivativeMarket
    },

    slug(): string {
      const { isSpotMarket, overwriteSlug } = this
      const { params } = this.$route

      if (overwriteSlug) {
        return overwriteSlug
      }

      return isSpotMarket ? params.spot : params.derivative
    },

    marketIsBeta(): boolean {
      const { slug } = this

      return betaMarketSlugs.includes(slug)
    }
  },

  mounted() {
    this.isSpotMarket = this.$route.name === 'spot-spot'
    this.$root.$on('toggle-market-list', this.toggleMarketList)

    Promise.all([this.initMarket(), this.getMarketsQuoteTokenUsdPrices()])
      .then(() => {
        this.setMarketQuoteTokenUsdPricesPolling()
      })
      .catch(this.$onRejected)
      .finally(() => {
        if (this.marketIsBeta) {
          this.$accessor.modal.openModal(Modal.MarketBeta)
        }

        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.exchange.fetchTradingRewardsCampaign(),
      this.$accessor.exchange.fetchFeeDiscountAccountInfo()
    ])
      .then(() => {})
      .catch(this.$onRejected)
  },

  beforeDestroy() {
    this.$root.$off('toggle-market-list', this.toggleMarketList)
    this.$accessor.derivatives.reset()
    this.$accessor.spot.reset()
    this.$accessor.modal.reset()
    clearInterval(this.interval)
  },

  methods: {
    initMarket(): Promise<void> {
      const { isSpotMarket, slug } = this

      return isSpotMarket
        ? this.$accessor.spot.initMarket(slug)
        : this.$accessor.derivatives.initMarket(slug)
    },

    getMarketsQuoteTokenUsdPrices(): Promise<void> {
      return this.$accessor.token.getTokenUsdPriceMap([
        ETH_COIN_GECKO_ID,
        USDT_COIN_GECKO_ID,
        UST_COIN_GECKO_ID
      ])
    },

    setMarketQuoteTokenUsdPricesPolling() {
      this.interval = setInterval(() => {
        this.getMarketsQuoteTokenUsdPrices()
      }, 10 * 1000)
    },

    toggleMarketList() {
      this.showMarketList = !this.showMarketList
    }
  }
})
</script>
