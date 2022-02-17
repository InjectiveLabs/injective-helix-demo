<template>
  <div>
    <h4 class="text-sm uppercase text-gray-400">
      {{ $t('funding.accountSummary') }}
    </h4>
    <div
      class="flex flex-wrap items-center justify-center lg:justify-between mt-4"
    >
      <div class="flex font-mono items-end">
        <h2 class="text-white text-xl lg:text-3xl mr-4">
          {{ balanceToString }} USD
        </h2>
        <span class="text-sm text-gray-400">
          {{ balanceInBtcToString }} BTC
        </span>
      </div>
      <div class="flex items-center">
        <v-button outline md class="mr-6" @click="handleDepositClick">
          {{ $t('common.deposit') }}
        </v-button>
        <v-button outline md class="mr-4" @click="handleWithdrawClick">
          {{ $t('common.withdraw') }}
        </v-button>
        <v-button outline md @click="handleTransferClick">
          {{ $t('common.transfer') }}
        </v-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  BankBalances,
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  SubaccountBalanceWithTokenWithUsdBalance,
  TokenWithBalanceAndPrice,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { SubaccountBalanceWithTokenAndPrice } from '~/types'

export default Vue.extend({
  components: {
    //
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    erc20TokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.erc20TokensWithBalanceAndPriceFromBank
    },

    ibcTokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.ibcTokensWithBalanceAndPriceFromBank
    },

    subaccountBalancesWithTokenAndPrice(): SubaccountBalanceWithTokenAndPrice[] {
      return this.$accessor.account.subaccountBalancesWithTokenAndPrice
    },

    // calculate and append total USD balances
    balances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const {
        bankBalances,
        erc20TokensWithBalanceAndPriceFromBank,
        ibcTokensWithBalanceAndPriceFromBank
      } = this

      return [
        ...erc20TokensWithBalanceAndPriceFromBank,
        ...ibcTokensWithBalanceAndPriceFromBank
      ].map((tokenWithBalance) => {
        const balanceInUsd = new BigNumberInWei(
          bankBalances[tokenWithBalance.denom] || 0
        )
          .toBase(tokenWithBalance.decimals)
          .times(tokenWithBalance.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return {
          balanceInUsd,
          balance: bankBalances[tokenWithBalance.denom] || ZERO_TO_STRING,
          denom: tokenWithBalance.denom,
          token: tokenWithBalance
        }
      })
    },

    tradingAccountBalances(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const { subaccountBalancesWithTokenAndPrice } = this

      return subaccountBalancesWithTokenAndPrice.map((balance) => {
        const balanceInUsd = new BigNumberInWei(balance.availableBalance)
          .toBase(balance.token.decimals)
          .times(balance.token.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return {
          ...balance,
          balanceInUsd
        }
      })
    },

    bankBalance(): BigNumberInBase {
      const { balances } = this

      return balances.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    tradingAccountBalance(): BigNumberInBase {
      const { tradingAccountBalances } = this

      return tradingAccountBalances.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    balance(): BigNumberInBase {
      const { tradingAccountBalance, bankBalance } = this

      return tradingAccountBalance.plus(bankBalance)
    },

    balanceToString(): string {
      const { balance } = this

      if (balance.eq(0)) {
        return '0.00'
      }

      if (balance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return balance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    balanceInBtc(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    balanceInBtcToString(): string {
      const { balance } = this

      if (balance.eq(0)) {
        return '0.00'
      }

      if (balance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return balance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  },

  mounted() {
    //
  },

  methods: {
    handleDepositClick() {
      this.$root.$emit('bridge:deposit')
    },

    handleWithdrawClick() {
      this.$root.$emit('bridge:withdraw')
    },

    handleTransferClick() {
      this.$root.$emit('bridge:transfer')
    }
  }
})
</script>
