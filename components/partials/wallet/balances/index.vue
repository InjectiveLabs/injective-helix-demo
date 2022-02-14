<template>
  <div>
    <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
      <TableHeader v-if="isUserWalletConnected">
        <span class="col-span-3">{{ $t('Asset') }}</span>
        <span class="col-span-3">
          <div class="flex items-center">
            <span class="flex-1 text-right">{{
              $t('Injective Chain Balance')
            }}</span>
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('ERC20 Balance') }}
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('Total') }}
          </div>
        </span>
      </TableHeader>

      <TableBody
        v-if="isUserWalletConnected"
        :show-empty="balances.length === 0"
      >
        <v-balance
          v-for="(balance, index) in sortedBalances"
          :key="`balance-${index}`"
          class="col-span-1"
          :balance="balance"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-3 text-center md:text-left">{{
            $t('There are no results found - Balances')
          }}</span>
        </template>
      </TableBody>
      <v-user-wallet-connect-warning v-else cta />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  BankBalanceWithToken,
  BankBalanceWithTokenAndBalance,
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  IbcBankBalanceWithToken,
  TokenWithBalance,
  INJECTIVE_DENOM
} from '@injectivelabs/ui-common'
import VBalance from './balance.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VBalance
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

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

    sortedBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { balances } = this

      return [...balances].sort(
        (
          v1: BankBalanceWithTokenAndBalanceWithUsdBalance,
          v2: BankBalanceWithTokenAndBalanceWithUsdBalance
        ) => {
          // sort INJ to the top
          if (v1.denom === INJECTIVE_DENOM) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM) {
            return 1
          }

          return new BigNumberInBase(v2.balanceInUsd)
            .minus(v1.balanceInUsd)
            .toNumber()
        }
      )
    }
  }
})
</script>
