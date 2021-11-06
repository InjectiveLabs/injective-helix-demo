<template>
  <div v-if="isUserWalletConnected" class="flex flex-wrap justify-between">
    <v-overview
      class="w-full lg:w-1/4"
      v-bind="{
        bankBalancesTotalInUsd,
        availableBalanceInUsd,
        unrealizedPnLInUsd,
        lockedBalanceInUsd
      }"
    />
    <v-stats
      class="w-full mt-4 lg:w-3/4 lg:mt-0"
      v-bind="{
        bankBalancesTotalInUsd,
        availableBalanceInUsd,
        unrealizedPnLInUsd,
        lockedBalanceInUsd
      }"
    />
  </div>
  <v-user-wallet-connect-warning v-else cta />
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import VOverview from './overview.vue'
import VStats from './stats.vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
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

    lockedBalanceInUsd(): BigNumberInBase {
      const { accountPortfolio } = this

      if (!accountPortfolio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(accountPortfolio.lockedBalance || 0)
    },

    unrealizedPnLInUsd(): BigNumberInBase {
      const { accountPortfolio } = this

      if (!accountPortfolio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(accountPortfolio.unrealizedPnl || 0)
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
    }
  }
})
</script>
