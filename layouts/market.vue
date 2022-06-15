<template>
  <HocLoading :key="$route.fullPath" :status="status">
    <div
      v-if="market"
      class="flex flex-col flex-wrap min-h-screen-excluding-header"
    >
      <div class="w-full px-1">
        <v-component
          :is="isSpotMarket ? 'SpotMarket' : 'DerivativeMarket'"
          :expanded="showMarketList"
        />
      </div>
      <div class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1">
        <div
          class="col-span-6 lg:col-span-3 4xl:col-span-3 overflow-y-hidden"
          data-cy="trading-side-component"
        >
          <MarketSelection v-show="showMarketList" key="market-selection" />
          <div
            v-show="!showMarketList"
            key="market-trading-panel"
            class="flex-col flex-wrap h-full w-full hidden lg:flex"
          >
            <slot name="trading-panel" />
          </div>
        </div>
        <div class="col-span-6 lg:col-span-9 4xl:col-span-9">
          <div class="flex flex-wrap flex-col w-full h-full">
            <div class="w-full">
              <VCard tight>
                <div class="grid grid-cols-6 lg:grid-cols-12">
                  <div class="col-span-6 lg:col-span-8 4xl:col-span-9">
                    <slot name="chart" />
                  </div>
                  <div class="col-span-6 lg:col-span-4 4xl:col-span-3">
                    <slot name="order-books" />
                  </div>
                </div>
              </VCard>

              <div class="w-full lg:hidden mt-2">
                <slot name="trading-panel" />
              </div>
            </div>
            <div class="w-full flex-1">
              <slot name="orders" />
            </div>
          </div>
        </div>
      </div>
      <slot name="modals" />
      <ModalMarketBeta v-if="marketIsBeta" />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import SpotMarket from '~/components/partials/spot/market.vue'
import DerivativeMarket from '~/components/partials/derivatives/market.vue'
import MarketSelection from '~/components/partials/common/market-selection/index.vue'
import ModalMarketBeta from '~/components/partials/modals/market-beta.vue'
import { betaMarketSlugs } from '~/app/data/market'
import { Modal } from '~/types'

export default Vue.extend({
  name: 'MarketsLayout',

  components: {
    DerivativeMarket,
    MarketSelection,
    ModalMarketBeta,
    SpotMarket
  },

  props: {
    hardcodedSlug: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      showMarketList: false
    }
  },

  computed: {
    derivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    spotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    isSpotMarket(): boolean {
      const { $route } = this

      return $route.name === 'spot-spot'
    },

    market(): UiSpotMarketWithToken | UiDerivativeMarketWithToken | undefined {
      const { derivativeMarket, isSpotMarket, spotMarket } = this

      return isSpotMarket ? spotMarket : derivativeMarket
    },

    slug(): string {
      const { isSpotMarket, hardcodedSlug } = this
      const { params } = this.$route

      if (hardcodedSlug) {
        return hardcodedSlug
      }

      return isSpotMarket ? params.spot : params.derivative
    },

    marketIsBeta(): boolean {
      const { slug } = this

      return betaMarketSlugs.includes(slug)
    }
  },

  mounted() {
    this.$root.$on('toggle-market-list', this.toggleMarketList)

    Promise.all([this.$accessor.spot.init(), this.$accessor.derivatives.init()])
      .then(async () => await this.initMarket())
      .catch(this.$onRejected)
      .finally(() => {
        if (this.marketIsBeta) {
          this.$accessor.modal.openModal(Modal.MarketBeta)
        }

        this.status.setIdle()
        this.$emit('loaded')
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
  },

  methods: {
    initMarket(): Promise<void> {
      const { isSpotMarket, slug } = this

      return isSpotMarket
        ? this.$accessor.spot.initMarket(slug)
        : this.$accessor.derivatives.initMarket(slug)
    },

    toggleMarketList() {
      this.showMarketList = !this.showMarketList
    }
  }
})
</script>
