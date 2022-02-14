<template>
  <VWallet
    :bank-account-balance="bankAccountBalance"
    :bank-account-balances="balances"
    :status="status"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BankBalanceWithToken,
  BankBalanceWithTokenAndBalance,
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  IbcBankBalanceWithToken,
  TokenWithBalance,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import VWallet from './index.vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VWallet
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    bankBalances(): BankBalanceWithToken[] {
      return this.$accessor.bank.balancesWithToken
    },

    ibcBankBalances(): IbcBankBalanceWithToken[] {
      return this.$accessor.bank.ibcBalancesWithToken
    },

    erc20TokensWithBalanceAndAllowance(): TokenWithBalance[] {
      return this.$accessor.token.erc20TokensWithBalanceFromBank
    },

    ibcTokensWithBalanceFromBank(): TokenWithBalance[] {
      return this.$accessor.token.ibcTokensWithBalanceFromBank
    },

    tokensWithPriceInUsd(): Record<string, string> {
      return this.$accessor.token.tokensWithPriceInUsd
    },

    ercBalances(): BankBalanceWithTokenAndBalance[] {
      const { bankBalances, erc20TokensWithBalanceAndAllowance } = this

      return bankBalances.map((bankBalance) => {
        const tokenWithBalance = erc20TokensWithBalanceAndAllowance.find(
          (token) =>
            token.address.toLowerCase() ===
            bankBalance.token.address.toLowerCase()
        )

        return {
          ...bankBalance,
          token: tokenWithBalance || {
            ...bankBalance.token,
            balance: '0',
            allowance: '0'
          }
        }
      })
    },

    ibcBalances(): BankBalanceWithTokenAndBalance[] {
      const { ibcBankBalances, ibcTokensWithBalanceFromBank } = this

      return ibcBankBalances.map((bankBalance) => {
        const tokenWithBalance = ibcTokensWithBalanceFromBank.find(
          (token) =>
            token.address.toLowerCase() ===
            bankBalance.token.address.toLowerCase()
        )

        return {
          ...bankBalance,
          token: tokenWithBalance || {
            ...bankBalance.token,
            balance: '0',
            allowance: '0'
          }
        }
      })
    },

    balances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { ercBalances, ibcBalances, tokensWithPriceInUsd } = this

      // calculate and append total USD balances
      return [...ercBalances, ...ibcBalances].map((balance) => {
        const usdPrice = tokensWithPriceInUsd[balance.token.denom] || 0

        const balanceInUsd = new BigNumberInWei(balance.balance)
          .toBase(balance.token.decimals)
          .times(usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return {
          ...balance,
          balanceInUsd
        }
      })
    },

    bankAccountBalance(): BigNumberInBase {
      const { balances } = this

      return balances.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.token.getAllTokenWithPriceInUsd(),
      this.$accessor.token.getAllTokenWithBalanceAndAllowance()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.wallet.resetPage()
  }
})
</script>
