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
            {{ $t('funding.portfolioValue') }}
          </p>
          <p class="text-2xl">{{ bankAccountBalanceToString }} USD</p>
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
          <p class="text-2xl">15,887.00 USD</p>
        </div>
      </v-card-select>
    </div>

    <div class="w-full mt-6 relative">
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
  TokenWithBalanceAndPrice,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import VBalances from '~/components/partials/funding/balances/index.vue'
import VTradingAccountBalances from '~/components/partials/funding/trading-account-balances/index.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VNewUserBanner from '~/components/partials/banners/gas-rebate.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'

const components = {
  bankAccount: 'balances',
  tradingAccount: 'trading-account-balances'
}

export default Vue.extend({
  components: {
    VBalances,
    HOCLoading,
    VTradingAccountBalances,
    VNewUserBanner,
    VWelcomeBanner
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

    bankAccountBalance(): BigNumberInBase {
      const { balances } = this

      return balances.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    bankAccountBalanceToString(): string {
      const { bankAccountBalance } = this

      if (bankAccountBalance.eq(0)) {
        return '0.00'
      }

      if (bankAccountBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankAccountBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
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

  watch: {
    isUserWalletConnected(isUserWalletConnected: boolean) {
      if (isUserWalletConnected) {
        if (this.component === components.bankAccount) {
          this.handleBankAccountClick()
        } else {
          this.handleTradingAccountClick()
        }
      }
    }
  },

  mounted() {
    this.handleBankAccountClick()
  },

  methods: {
    handleBankAccountClick() {
      this.status.setLoading()

      Promise.all([
        this.$accessor.token.getBitcoinUsdPrice(),
        this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBank()
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    // TODO
    handleTradingAccountClick() {
      //
    }
  }
})
</script>
