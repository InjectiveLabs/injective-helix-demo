<template>
  <div class="convert-container min-h-screen-excluding-header">
    <HocLoading :key="$route.fullPath" :status="status">
      <div class="container">
        <div>from: {{ fromToken }}</div>
        <div>to: {{ toToken }}</div>
        <div>market: {{ market }}</div>
        <div class="mx-auto h-full w-full sm:w-md flex flex-col justify-center">
          <Convert
            class="mt-[-56px]"
            :fetch-status="fetchStatus"
            :from-token="fromToken"
            :to-token="toToken"
            @update:from-token="handleFromTokenChange"
            @update:to-token="handleToTokenChange"
            @update:switch="handleSwitchTokens"
          />
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import Convert from '~/components/partials/convert/index.vue'
import { Modal } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'

export default Vue.extend({
  components: {
    Convert
  },

  data() {
    return {
      fetchStatus: new Status(StatusType.Idle),
      status: new Status(StatusType.Loading),
      interval: 0 as any,
      fromToken: undefined as Token | undefined,
      toToken: undefined as Token | undefined
    }
  },

  computed: {
    marketIsBeta(): boolean {
      const { params } = this.$route
      return betaMarketSlugs.includes(params.spot)
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$store.state.spot.markets
    },

    market(): UiSpotMarketWithToken | undefined {
      const { fromToken, toToken, markets } = this

      if (!fromToken || !toToken) {
        return undefined
      }

      const slug = ['usdt'].includes(fromToken.symbol.toLowerCase())
        ? `${toToken.symbol.toLowerCase()}-${fromToken.symbol.toLowerCase()}`
        : `${fromToken.symbol.toLowerCase()}-${toToken.symbol.toLocaleLowerCase()}`

      return markets.find(
        (market: UiSpotMarketWithToken) => market.slug === slug
      )
    }
  },

  watch: {
    market: {
      handler(market: UiSpotMarketWithToken | undefined) {
        if (market) {
          this.initMarket(market.slug)
        }
      },
      immediate: true
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
        this.status.setIdle()

        this.initTokens()

        this.startPollingOrderbook()
      })
  },

  beforeDestroy() {
    this.$accessor.spot.reset()
    this.$accessor.modal.reset()
    clearInterval(this.interval)
  },

  methods: {
    initTokens() {
      const { from, to } = this.$route.query

      if (from) {
        this.fromToken = this.getTokenBySymbol(from)
      }

      if (to) {
        this.toToken = this.getTokenBySymbol(to)
      }
    },

    initMarket(slug: string) {
      this.fetchStatus.setLoading()

      console.log('initializing market:', slug)

      Promise.all([
        this.$accessor.spot.reset(),
        this.$accessor.spot.initMarket(slug),
        this.$accessor.spot.initMarketStreams()
      ]).finally(() => {
        this.fetchStatus.setIdle()
      })

      if (this.marketIsBeta) {
        this.$accessor.modal.openModal({ type: Modal.MarketBeta })
      }
    },

    handleFromTokenChange(token: Token) {
      const { toToken } = this

      this.fromToken = token

      this.$router.replace({
        name: 'convert-convert',
        query: {
          from: token.symbol.toLowerCase(),
          to: toToken ? toToken.symbol.toLowerCase() : undefined
        }
      })
    },

    handleToTokenChange(token: Token) {
      const { fromToken } = this

      this.toToken = token

      this.$router.replace({
        name: 'convert-convert',
        query: {
          from: fromToken ? fromToken.symbol.toLowerCase() : undefined,
          to: token.symbol.toLowerCase()
        }
      })
    },

    handleSwitchTokens({ from, to }: { from: Token; to: Token }) {
      this.fromToken = from
      this.toToken = to

      this.$router.replace({
        name: 'convert-convert',
        query: {
          from: from.symbol.toLowerCase(),
          to: to.symbol.toLowerCase()
        }
      })
    },

    startPollingOrderbook() {
      if (this.interval) {
        clearInterval(this.interval)
      }

      this.$accessor.spot.pollOrderbook()
      this.interval = setInterval(() => {
        this.$accessor.spot.pollOrderbook()
      }, 5000)
    },

    getTokenBySymbol(symbol: string): Token | undefined {
      const { markets } = this

      const market = markets.find((m: UiSpotMarketWithToken) =>
        m.slug.includes(symbol)
      )

      if (!market) {
        return undefined
      }

      if (market.baseToken.symbol.toLowerCase() === symbol) {
        return market.baseToken
      }

      return market.quoteToken
    }
  }
})
</script>

<style lang="scss" scoped>
.convert-container {
  @apply h-full w-full flex flex-wrap py-4;
  // background: radial-gradient(
  //     45.83% 49.94% at 100% 0%,
  //     rgba(1, 184, 252, 0.15) 0%,
  //     rgba(13, 191, 200, 0) 100%
  //   ),
  //   radial-gradient(
  //     75.69% 42.3% at 0% 100%,
  //     rgba(1, 184, 252, 0.15) 0%,
  //     rgba(13, 191, 200, 0) 100%
  //   );
}
</style>
