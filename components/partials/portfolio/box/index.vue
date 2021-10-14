<template>
  <v-card class="mt-6">
    <div v-if="isUserWalletConnected">
      <v-overview
        v-bind="{
          bankBalance: bankBalancesTotal
        }"
      />
      <v-stats
        class="mt-6"
        v-bind="{
          bankBalance: bankBalancesTotal,
          bankBalanceToString
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
  UI_DEFAULT_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  BankBalanceWithTokenMetaData,
  BankBalanceWithTokenMetaDataAndBalance,
  TokenWithBalance
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

    bankBalances(): BankBalanceWithTokenMetaData[] {
      return this.$accessor.bank.balancesWithTokenMetaData
    },

    erc20TokensWithBalanceAndAllowance(): TokenWithBalance[] {
      return this.$accessor.token.erc20TokensWithBalanceFromBank
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

    bankBalancesTotal(): BigNumberInBase {
      const { balances } = this

      return balances.reduce((total, balance) => {
        return total.plus(
          new BigNumberInWei(balance.balance).toBase(balance.token.decimals)
        )
      }, ZERO_IN_BASE)
    },

    bankBalanceToString(): string {
      const { bankBalancesTotal } = this

      if (bankBalancesTotal.gt(MAX_SMALLER_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_SMALLER_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_DISPLAY_DECIMALS
        )}`
      }

      return bankBalancesTotal.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    }
  }
})
</script>
