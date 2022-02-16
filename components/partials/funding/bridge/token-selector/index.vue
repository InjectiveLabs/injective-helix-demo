<template>
  <div>
    <v-token-selector
      v-bind="$attrs"
      :options="supplyWithSortedBalanceInBase"
      @input="handleTokenChange"
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
  Token,
  SubaccountBalanceWithToken
} from '@injectivelabs/ui-common'
import VTokenSelector from './select.vue'
import { TransferSide } from '~/types'

export default Vue.extend({
  components: {
    VTokenSelector
  },

  props: {
    destination: {
      type: String as PropType<BridgingNetwork | TransferSide>,
      required: true
    },

    origin: {
      type: String as PropType<BridgingNetwork | TransferSide>,
      required: true
    }
  },
  computed: {
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

    subaccountBalancesWithTokenSupply(): BankBalanceWithToken[] {
      const { subaccountBalancesWithToken } = this

      return subaccountBalancesWithToken.map((balance) => ({
        ...balance,
        balance: balance.availableBalance
      }))
    },

    supply(): BankBalanceWithToken[] {
      const {
        bankBalancesWithToken,
        subaccountBalancesWithTokenSupply,
        destination,
        origin
      } = this

      if (origin === BridgingNetwork.Ethereum) {
        return [] // TODO
      }

      if (origin === TransferSide.Bank) {
        return bankBalancesWithToken
      }

      if (origin === TransferSide.TradingAccount) {
        return subaccountBalancesWithTokenSupply
      }

      if (destination === BridgingNetwork.Ethereum) {
        return bankBalancesWithToken
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
      this.$emit('input', value)
    }
  }
})
</script>
