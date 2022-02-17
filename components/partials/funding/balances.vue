<template>
  <div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <v-card-select v-model="component" lg :option="components.bankAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('funding.bankAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('funding.bankAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('funding.walletValue') }}
          </p>
          <p class="text-2xl">{{ bankBalanceToString }} USD</p>
        </div>
      </v-card-select>

      <v-card-select v-model="component" lg :option="components.tradingAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('funding.tradingAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('funding.tradingAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('funding.portfolioValue') }}
          </p>
          <p class="text-2xl">{{ tradingAccountBalanceToString }}</p>
        </div>
      </v-card-select>
    </div>

    <div class="w-full mt-6 relative">
      <portal to="account-summary">
        <div v-if="status.isLoading()" class="h-16 w-full xl:w-1/4 relative">
          <v-loading />
        </div>
        <v-account-summary v-else />
      </portal>
      <v-panel :title="panelTitle">
        <HOCLoading :status="status">
          <component :is="`v-${component}`" v-bind="{ balances }"></component>
        </HOCLoading>
      </v-panel>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import {
  BankBalances,
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  SubaccountBalanceWithTokenWithUsdBalance,
  TokenWithBalanceAndPrice,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import VBankBalances from '~/components/partials/funding/bank-balances/index.vue'
import VAccountSummary from '~/components/partials/funding/account-summary.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { SubaccountBalanceWithTokenAndPrice } from '~/types'
import VLoading from '~/components/elements/loading.vue'

const components = {
  bankAccount: 'bank-balances',
  tradingAccount: 'trading-account-balances'
}

export default Vue.extend({
  components: {
    VBankBalances,
    VLoading,
    VAccountSummary,
    HOCLoading
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      components,
      component: components.bankAccount
    }
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

    bankBalanceToString(): string {
      const { bankBalance } = this

      if (bankBalance.eq(0)) {
        return '0.00'
      }

      if (bankBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    tradingAccountBalance(): BigNumberInBase {
      const { tradingAccountBalances } = this

      return tradingAccountBalances.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    tradingAccountBalanceToString(): string {
      const { tradingAccountBalance } = this

      if (tradingAccountBalance.eq(0)) {
        return '0.00'
      }

      if (tradingAccountBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return tradingAccountBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    panelTitle(): string {
      const { component } = this

      return this.$t(
        `funding.${
          component === components.bankAccount
            ? 'bankBalances'
            : 'tradingAccountBalances'
        }`
      )
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBank(),
      this.$accessor.account.fetchSubaccountsBalancesWithPrices()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([this.$accessor.token.getBitcoinUsdPrice()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        //
      })
  }
})
</script>
