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
          v-for="(balance, index) in balances"
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
import VBalance from './balance.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import { TokenWithBalance } from '~/types/token'
import {
  BankBalanceWithTokenMetaData,
  BankBalanceWithTokenMetaDataAndBalance
} from '~/types/bank'

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
    }
  }
})
</script>
