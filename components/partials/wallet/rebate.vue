<template>
  <div>
    <div
      v-if="showRebateBanner && isUserWalletConnected"
      class="bg-primary-500 text-primary-900 text-center py-1 text-sm font-semibold relative"
    >
      <div>
        <span class="mr-4">{{ $t('gas_fee_of_first_deposit_covered') }}</span>
        <span class="underline cursor-pointer" @click="onClickReadMore">{{
          $t('read_more')
        }}</span>
      </div>
      <span
        class="absolute right-0 top-0 cursor-pointer mt-1 mr-4"
        @click="onClickHideRebateBanner"
      >
        <v-icon-close class="w-5 h-5" />
      </span>
    </div>
    <v-modal-gas-rebate
      v-bind="{
        hasDepositedMoreThanMinimalUsdt,
        hasTradeWithMinimumNotionalUsdt
      }"
    />
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiDerivativeTrade,
  UiSpotMarketWithToken,
  UiSpotTrade,
  BankBalanceWithToken,
  SubaccountBalanceWithToken,
  Token,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { UserDeposit } from '@injectivelabs/ui-common/dist/bridge/gql/types'
import { Modal } from '~/types'
import {
  MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE,
  MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE
} from '~/app/utils/constants'
import VModalGasRebate from '~/components/partials/modals/gas-rebate.vue'

export default Vue.extend({
  components: {
    VModalGasRebate
  },

  data() {
    return {
      showRebateBanner: true
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    deposits(): UserDeposit[] {
      return this.$accessor.gasRebate.deposits
    },

    trades(): Array<UiSpotTrade | UiDerivativeTrade> {
      return this.$accessor.gasRebate.trades
    },

    bankBalances(): BankBalanceWithToken[] {
      return this.$accessor.bank.balancesWithToken
    },

    subaccountBalanceWithToken(): SubaccountBalanceWithToken[] {
      return this.$accessor.account.subaccountBalancesWithToken
    },

    bankUsdtBalance(): BankBalanceWithToken | undefined {
      const { bankBalances } = this

      return bankBalances.find(
        (bankBalance: BankBalanceWithToken) =>
          bankBalance.token.symbol.toUpperCase() === 'USDT'
      )
    },

    subaccountUsdtBalance(): SubaccountBalanceWithToken | undefined {
      const { subaccountBalanceWithToken } = this

      return subaccountBalanceWithToken.find(
        (balance: SubaccountBalanceWithToken) =>
          balance.token.symbol.toUpperCase() === 'USDT'
      )
    },

    hasUsdtBalance(): boolean {
      const { bankUsdtBalance, subaccountUsdtBalance } = this

      return (
        bankUsdtBalance !== undefined || subaccountUsdtBalance !== undefined
      )
    },

    hasTrades(): boolean {
      const { trades } = this

      return trades.length > 0
    },

    hasTradeWithMinimumNotionalUsdt(): boolean {
      const { derivativeMarkets, spotMarkets, trades } = this

      let sum = ZERO_IN_BASE

      for (const trade of trades) {
        const isSpotMarket = spotMarkets
          .map((market) => market.marketId)
          .includes(trade.marketId)
        const markets = [...derivativeMarkets, ...spotMarkets]
        const market = markets.find(
          (market) => market.marketId === trade.marketId
        )

        if (!market) {
          continue
        }

        if (sum.gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)) {
          break
        }

        if (isSpotMarket) {
          const spotMarket = market as UiSpotMarketWithToken
          const spotTrade = trade as UiSpotTrade
          const price = new BigNumberInBase(
            new BigNumberInBase(spotTrade.price).toWei(
              spotMarket.baseToken.decimals - spotMarket.quoteToken.decimals
            )
          )
          const quantity = new BigNumberInWei(spotTrade.quantity).toBase(
            spotMarket.baseToken.decimals
          )

          sum = sum.plus(price.times(quantity))
        } else {
          const derivativeMarket = market as UiDerivativeMarketWithToken
          const derivativeTrade = trade as UiDerivativeTrade
          const margin = new BigNumberInWei(
            derivativeTrade.executionMargin
          ).toBase(derivativeMarket.quoteToken.decimals)

          sum = sum.plus(margin)
        }
      }

      return sum.gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)
    },

    hasDepositedMoreThanMinimalUsdt(): boolean {
      const {
        deposits,
        bankUsdtBalance,
        subaccountUsdtBalance,
        hasUsdtBalance
      } = this

      if (!hasUsdtBalance) {
        return false
      }

      const tokenWithBalance = ((bankUsdtBalance ||
        subaccountUsdtBalance) as unknown) as { token: Token }
      const usdtToken = tokenWithBalance.token
      const usdtAddress = usdtToken.address.replace('peggy', '').toLowerCase()

      const deposit = deposits.find((deposit) => {
        const addressCondition =
          deposit.tokenContract.toLowerCase() === usdtAddress.toLowerCase()
        const amountCondition = new BigNumberInWei(deposit.amount)
          .toBase(usdtToken.decimals)
          .gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)
        const timestampCondition =
          deposit.timestamp >= MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE

        return addressCondition && amountCondition && timestampCondition
      })

      return deposit !== undefined
    }
  },

  mounted() {
    // this.showRebateBanner = !localStorage.has('hideRebateBanner')
  },

  methods: {
    onClickReadMore() {
      this.$accessor.modal.openModal(Modal.GasFeeRebate)
    },

    onClickHideRebateBanner() {
      // localStorage.set('hideRebateBanner', true)
      this.showRebateBanner = false
    }
  }
})
</script>
