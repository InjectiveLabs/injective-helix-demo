<template>
  <div class="convert-container min-h-screen-excluding-header">
    <HocLoading :key="$route.fullPath" :status="status">
      <div class="container">
        <div class="mx-auto h-full w-full sm:w-md flex flex-col justify-center">
          <Convert class="mt-[-56px]" @set-market="setMarket" />
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Convert from '~/components/partials/convert/index.vue'
import { Modal } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'

export default Vue.extend({
  components: {
    Convert
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
      this.$accessor.spot.fetchOrderbook(),
      this.$accessor.exchange.fetchTradingRewardsCampaign(),
      this.$accessor.exchange.fetchFeeDiscountAccountInfo(),
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBankAndMarkets()
    ])
      .catch(this.$onRejected)
      .then(() => {
        this.setMarket('inj-usdt')
        this.startPollingOrderbook()
      })
  },

  beforeDestroy() {
    this.$accessor.spot.reset()
    this.$accessor.modal.reset()
    clearInterval(this.interval)
  },

  methods: {
    async setMarket(slug: string) {
      await this.$accessor.spot.reset()
      await this.$accessor.spot.initMarket(slug)
      await this.$accessor.spot.initMarketStreams()

      this.status.setIdle()

      if (this.marketIsBeta) {
        this.$accessor.modal.openModal(Modal.MarketBeta)
      }
    },

    startPollingOrderbook() {
      if (this.interval) {
        clearInterval(this.interval)
      }

      this.$accessor.spot.pollOrderbook()
      this.interval = setInterval(() => {
        this.$accessor.spot.pollOrderbook()
      }, 5000)
    }
  }
})
</script>

<style lang="scss" scoped>
.convert-container {
  @apply h-full w-full flex flex-wrap py-4;
  background: radial-gradient(
      45.83% 49.94% at 100% 0%,
      rgba(1, 184, 252, 0.15) 0%,
      rgba(13, 191, 200, 0) 100%
    ),
    radial-gradient(
      75.69% 42.3% at 0% 100%,
      rgba(1, 184, 252, 0.15) 0%,
      rgba(13, 191, 200, 0) 100%
    );
}
</style>
