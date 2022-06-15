<template>
  <div>
    <TokenSelector
      v-bind="$attrs"
      :options="supplyWithSortedBalanceInBase"
      :disabled="isIbcTransfer"
      @input:token="handleTokenChange"
      @input:amount="handleAmountChange"
    />
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  BridgingNetwork,
  BankBalanceWithToken,
  BankBalanceWithTokenAndBalance,
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import TokenSelector from './select.vue'
import { TransferSide, TransferDirection } from '~/types'

export default Vue.extend({
  components: {
    TokenSelector
  },

  props: {
    origin: {
      type: String as PropType<
        BridgingNetwork | TransferSide | TransferDirection
      >,
      required: true
    },

    destination: {
      type: String as PropType<
        BridgingNetwork | TransferSide | TransferDirection
      >,
      required: true
    },

    isIbcTransfer: {
      type: Boolean,
      required: true
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

    supply(): BankBalanceWithToken[] {
      const {
        bankBalancesWithToken,
        subaccountBalancesWithTokenAsBankBalanceWithToken,
        erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken,
        origin,
        destination,
        isIbcTransfer
      } = this

      if (isIbcTransfer) {
        return [] // IBC transfers are not supported on the Bridge Lite
      }

      if (
        origin === BridgingNetwork.Ethereum &&
        destination === BridgingNetwork.Injective
      ) {
        return erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken
      }

      if (
        origin === BridgingNetwork.Injective &&
        destination === BridgingNetwork.Ethereum
      ) {
        return erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken
      }

      if (origin === TransferDirection.bankToTradingAccount) {
        return bankBalancesWithToken
      }

      if (origin === TransferDirection.tradingAccountToBank) {
        return subaccountBalancesWithTokenAsBankBalanceWithToken
      }

      return bankBalancesWithToken
    },

    supplyWithSortedBalanceInBase(): BankBalanceWithTokenAndBalance[] {
      const { supply } = this

      return supply
        .map((token) => {
          const balance = new BigNumberInWei(token.balance || 0).toBase(
            token.token ? token.token.decimals : 18
          )

          return {
            ...token,
            balance: balance.toFixed()
          } as BankBalanceWithTokenAndBalance
        })
        .sort((supply1, supply2) =>
          new BigNumberInBase(supply2.balance).minus(supply1.balance).toNumber()
        )
    }
  },

  methods: {
    handleAmountChange(value: string) {
      this.$emit('input:amount', value)
    },

    handleTokenChange(value: Token) {
      this.$emit('input:token', value)
    }
  }
})
</script>
