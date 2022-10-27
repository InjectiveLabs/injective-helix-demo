<template>
  <div class="convert-container min-h-screen-excluding-header">
    <HocLoading :key="$route.fullPath" :status="status">
      <div class="container">
        <div class="mx-auto h-full w-full sm:w-md flex flex-col justify-center">
          <Convert
            class="mt-[-56px]"
            :fetch-status="fetchStatus"
            :from-token="fromToken"
            :to-token="toToken"
            :market="market"
            :order-type="orderType"
            :tokens-with-balances="tokensWithBalances"
            :from-usd-price="fromUsdPrice"
            @update:from-token="handleFromTokenChange"
            @update:to-token="handleToTokenChange"
            @update:switch="handleSwitchTokens"
            @update:prices="handleUpdatePrices"
          />
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  BankBalanceWithToken,
  BankBalanceWithTokenAndBalance,
  getTokenLogoWithVendorPathPrefix,
  SpotOrderSide,
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
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
      orderbookInterval: 0 as any,
      pricesInterval: 0 as any,
      fromToken: undefined as Token | undefined,
      toToken: undefined as Token | undefined,
      orderType: SpotOrderSide.Buy,
      fromUsdPricePending: false,
      fromUsdPrice: 0
    }
  },

  computed: {
    erc20TokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.erc20TokensWithBalanceAndPriceFromBank
    },

    bankErc20BalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankErc20BalancesWithToken
    },

    bankIbcBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankIbcBalancesWithToken
    },

    bankBalancesWithToken(): BankBalanceWithToken[] {
      const { bankErc20BalancesWithToken, bankIbcBalancesWithToken } = this

      return [...bankErc20BalancesWithToken, ...bankIbcBalancesWithToken]
    },

    subaccountBalancesWithToken(): SubaccountBalanceWithToken[] {
      return this.$accessor.account.subaccountBalancesWithToken
    },

    subaccountBalancesWithTokenAsBankBalanceWithToken(): BankBalanceWithToken[] {
      const { subaccountBalancesWithToken } = this

      return subaccountBalancesWithToken.map((balance) => ({
        ...balance,
        balance: balance.availableBalance
      }))
    },

    erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken(): BankBalanceWithToken[] {
      const { erc20TokensWithBalanceAndPriceFromBank } = this

      return erc20TokensWithBalanceAndPriceFromBank
        .map((token) => ({
          token,
          denom: token.denom,
          balance: token.balance
        }))
        .filter(({ denom }) => !denom.startsWith('ibc'))
    },

    tokensWithBalances(): BankBalanceWithTokenAndBalance[] {
      const { bankBalancesWithToken, supportedTokens } = this

      return supportedTokens.map((t) => {
        const balanceWithToken = bankBalancesWithToken.find(
          (b) => b.denom === t.denom
        )

        const token = {
          ...t,
          logo: getTokenLogoWithVendorPathPrefix(t.logo)
        }

        const denom = t.denom
        const balance = balanceWithToken ? balanceWithToken.balance : '0'

        return {
          balance,
          denom,
          token
        } as BankBalanceWithTokenAndBalance
      })
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    marketIsBeta(): boolean {
      const { params } = this.$route
      return betaMarketSlugs.includes(params.spot)
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    supportedTokens(): Token[] {
      return this.$accessor.spot.supportedTokens
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
    },

    hasEnoughInjForGasOrNotCosmosWallet(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (!isCosmosWallet(wallet)) {
        return true
      }

      return hasEnoughInjForGas
    }
  },

  watch: {
    market: {
      handler(market: UiSpotMarketWithToken | undefined) {
        if (market) {
          this.initMarket(market.slug)
          this.handleOrderTypeChange()
          return
        }

        if (!this.fromToken || !this.toToken) {
          return
        }

        this.resetToDefaultMarket()
      },
      immediate: true
    }
  },

  mounted() {
    if (!this.hasEnoughInjForGasOrNotCosmosWallet) {
      this.$accessor.modal.openModal({ type: Modal.InsufficientInjForGas })
    }

    Promise.all([
      this.$accessor.spot.init(),
      this.$accessor.spot.fetchOrderbook(),
      this.$accessor.exchange.fetchTradingRewardsCampaign(),
      this.$accessor.exchange.fetchFeeDiscountAccountInfo(),
      this.$accessor.bank.fetchBankBalancesWithToken(),
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBankAndMarkets()
    ])
      .catch(this.$onRejected)
      .then(() => {
        this.status.setIdle()

        this.initTokens()

        this.startPollingOrderbook()
        this.startPollingPrices()
      })
  },

  beforeDestroy() {
    this.$accessor.spot.reset()
    this.$accessor.modal.reset()

    clearInterval(this.orderbookInterval)
    clearInterval(this.pricesInterval)
  },

  methods: {
    initTokens() {
      const { from, to } = this.$route.query

      if (from === to) {
        return this.resetToDefaultMarket()
      }

      if (from) {
        this.fromToken = this.getTokenBySymbol(from)
      }

      if (to) {
        this.toToken = this.getTokenBySymbol(to)
      }

      if (!this.fromToken || !this.toToken) {
        this.resetToDefaultMarket()
      }
    },

    initMarket(slug: string) {
      this.fetchStatus.setLoading()

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

      this.updateQueryParams({
        from: token.symbol.toLowerCase(),
        to: toToken ? toToken.symbol.toLowerCase() : undefined
      })

      this.handleOrderTypeChange()
    },

    handleToTokenChange(token: Token) {
      const { fromToken } = this

      this.toToken = token

      this.updateQueryParams({
        from: fromToken ? fromToken.symbol.toLowerCase() : undefined,
        to: token.symbol.toLowerCase()
      })

      this.handleOrderTypeChange()
    },

    handleSwitchTokens({ from, to }: { from: Token; to: Token }) {
      this.fromToken = from
      this.toToken = to

      this.updateQueryParams({
        from: from.symbol.toLowerCase(),
        to: to.symbol.toLowerCase()
      })
    },

    handleOrderTypeChange() {
      const { market, fromToken } = this

      if (!market || !fromToken) {
        return
      }

      this.orderType =
        market.baseDenom === fromToken.denom
          ? SpotOrderSide.Sell
          : SpotOrderSide.Buy
    },

    updateQueryParams({
      from,
      to
    }: {
      from: string | undefined
      to: string | undefined
    }) {
      const { from: currentFrom, to: currentTo } = this.$route.query

      if (from === currentFrom && to === currentTo) {
        return
      }

      this.$router.replace({
        name: 'convert-convert',
        query: { from, to }
      })
    },

    startPollingOrderbook() {
      const { orderbookInterval } = this

      if (orderbookInterval) {
        clearInterval(orderbookInterval)
      }

      this.$accessor.spot.pollOrderbook()

      this.orderbookInterval = setInterval(
        this.$accessor.spot.pollOrderbook,
        5000
      )
    },

    startPollingPrices() {
      const { pricesInterval } = this

      if (pricesInterval) {
        clearInterval(pricesInterval)
      }

      this.handleUpdatePrices()

      this.pricesInterval = setInterval(this.handleUpdatePrices, 5000)
    },

    getTokenBySymbol(symbol: string) {
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
    },

    resetToDefaultMarket() {
      const from = this.getTokenBySymbol('usdt')
      const to = this.getTokenBySymbol('inj')

      if (!from || !to) {
        return
      }

      this.handleSwitchTokens({ from, to })

      this.$toast.error(
        this.$t('trade.convert.reset_to_default_pair', { pair: 'USDT/INJ' })
      )
    },

    handleUpdatePrices() {
      const { fromToken } = this

      if (!fromToken) {
        return
      }

      this.fromUsdPricePending = true

      this.$accessor.spot
        .fetchUsdPrice(fromToken.coinGeckoId)
        .then((price: number) => {
          this.fromUsdPrice = price
        })
        .catch(this.$onError)
        .finally(() => {
          this.fromUsdPricePending = false
        })
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
