<template>
  <v-card class="mt-6">
    <div v-if="isUserWalletConnected">
      <v-overview
        v-bind="{
          bankBalancesTotalInUsd,
          availableBalanceInUsd,
          unrealizedPnLInUsd,
          lockedBalanceInUsd
        }"
      />
      <v-stats
        class="mt-6"
        v-bind="{
          bankBalancesTotalInUsd,
          bankBalancesTotalInUsdToString,
          availableBalanceInUsd,
          availableBalanceInUsdToString,
          unrealizedPnLInUsd,
          unrealizedPnLInUsdToString,
          lockedBalanceInUsd,
          lockedBalanceInUsdToString
        }"
      />
    </div>
    <v-user-wallet-connect-warning v-else cta />
  </v-card>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import VOverview from './overview.vue'
import VStats from './stats.vue'
import {
  MAX_SMALLER_DISPLAYABLE_NUMBER,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  BankBalanceWithTokenMetaData,
  BankBalanceWithTokenMetaDataAndBalance,
  TokenWithBalance,
  AccountPortfolio
} from '~/types'

export default Vue.extend({
  components: {
    VOverview,
    VStats
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    accountPortfolio(): AccountPortfolio | undefined {
      return this.$accessor.account.accountPortfolio
    },

    bankBalances(): BankBalanceWithTokenMetaData[] {
      return this.$accessor.bank.balancesWithTokenMetaData
    },

    erc20TokensWithBalanceAndAllowance(): TokenWithBalance[] {
      return this.$accessor.token.erc20TokensWithBalanceFromBank
    },

    availableBalanceInUsd(): BigNumberInBase {
      const { accountPortfolio } = this

      if (!accountPortfolio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(accountPortfolio.availableBalance || 0)
    },

    availableBalanceInUsdToString(): string {
      const { availableBalanceInUsd } = this

      if (availableBalanceInUsd.gt(MAX_SMALLER_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_SMALLER_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return availableBalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    lockedBalanceInUsd(): BigNumberInBase {
      const { accountPortfolio } = this

      if (!accountPortfolio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(accountPortfolio.lockedBalance || 0)
    },

    lockedBalanceInUsdToString(): string {
      const { lockedBalanceInUsd } = this

      if (lockedBalanceInUsd.gt(MAX_SMALLER_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_SMALLER_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return lockedBalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    unrealizedPnLInUsd(): BigNumberInBase {
      const { accountPortfolio } = this

      if (!accountPortfolio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(accountPortfolio.unrealizedPnl || 0)
    },

    unrealizedPnLInUsdToString(): string {
      const { unrealizedPnLInUsd } = this

      if (unrealizedPnLInUsd.gt(MAX_SMALLER_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_SMALLER_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return unrealizedPnLInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    balances(): BankBalanceWithTokenMetaDataAndBalance[] {
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

    bankBalancesTotalInUsd(): BigNumberInBase {
      const { balances } = this

      return balances.reduce((total, balance) => {
        return total.plus(
          new BigNumberInWei(balance.balance)
            .toBase(balance.token.decimals)
            .times(balance.token.priceInUsd || 0)
        )
      }, ZERO_IN_BASE)
    },

    bankBalancesTotalInUsdToString(): string {
      const { bankBalancesTotalInUsd } = this

      if (bankBalancesTotalInUsd.gt(MAX_SMALLER_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_SMALLER_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankBalancesTotalInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
