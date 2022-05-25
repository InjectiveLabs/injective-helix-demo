<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <VHocLoading :key="$route.fullPath" :status="status">
      <div class="container">
        <div class="mx-auto w-full sm:w-md">
          <div class="flex flex-col mt-6">
            <v-swap :set-market="setMarket" />
          </div>
        </div>
      </div>
    </VHocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import VSwap from '~/components/partials/swap/index.vue'
import { Modal } from '~/types'
import { ORDERBOOK_POLLING_ENABLED } from '~/app/utils/constants'
import { betaMarketSlugs } from '~/app/data/market'

export default Vue.extend({
  components: {
    VSwap
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    marketIsBeta(): boolean {
      const { params } = this.$route
      return betaMarketSlugs.includes(params.spot)
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$store.state.spot.markets
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.spot.init(),
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBankAndMarkets()
    ])
      .then(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.spot.reset()
    this.$accessor.modal.reset()
    clearInterval(this.interval)
  },

  methods: {
    setOrderbookPolling() {
      if (ORDERBOOK_POLLING_ENABLED) {
        this.interval = setInterval(async () => {
          await this.$accessor.derivatives.pollOrderbook()
        }, 2000)
      }
    },

    setMarket(slug: string) {
      this.$accessor.spot.reset()
      this.$accessor.spot
        .initMarket(slug)
        .then(() => {
          this.setOrderbookPolling()
          this.$accessor.spot.initMarketStreams()
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
          if (this.marketIsBeta) {
            this.$accessor.modal.openModal(Modal.MarketBeta)
          }
        })

      Promise.all([
        this.$accessor.spot.init(),
        this.$accessor.spot.fetchOrderbook(),
        this.$accessor.spot.fetchTrades(),
        this.$accessor.exchange.fetchTradingRewardsCampaign(),
        this.$accessor.exchange.fetchFeeDiscountAccountInfo()
      ])
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    }
  }
})
</script>
