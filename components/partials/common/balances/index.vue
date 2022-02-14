<template>
  <v-panel class="w-full">
    <div>
      <p class="text-xs text-gray-300 flex items-center">
        {{ $t('marketPage.funding') }}
        <v-icon-info-tooltip
          class="ml-2"
          :tooltip="$t('marketPage.fundingNote')"
        />
      </p>
      <div v-if="isUserWalletConnected">
        <div v-if="currentMarket" class="mt-2">
          <div v-if="!hasBankBalances">
            <p class="text-xs text-gray-500">
              {{ $t('marketPage.noChainBalance') }}
            </p>
          </div>
          <v-subaccount-balance
            v-if="hasBankBalances"
            v-bind="{
              baseTradingBalance,
              quoteTradingBalance,
              market: currentMarket
            }"
          >
          </v-subaccount-balance>
          <v-onboard
            v-bind="{ hasBankBalances, hasTradingAccountBalances }"
            class="mt-6"
          ></v-onboard>
        </div>
      </div>
      <v-user-wallet-connect-warning v-else />
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  MarketType,
  BankBalances,
  UiSubaccount,
  UiSubaccountBalanceWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import VSubaccountBalance from './subaccount.vue'
import VOnboard from './onboard.vue'
import { getHubUrl } from '~/app/utils/helpers'

type CurrentMarket =
  | UiSpotMarketWithToken
  | UiDerivativeMarketWithToken
  | undefined

export default Vue.extend({
  components: {
    VSubaccountBalance,
    VOnboard
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    ibcBalances(): BankBalances {
      return this.$accessor.bank.ibcBalances
    },

    balances(): BankBalances {
      const { bankBalances, ibcBalances } = this
      return { ...bankBalances, ...ibcBalances }
    },

    currentSpotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    currentMarket(): CurrentMarket {
      const { currentSpotMarket, currentDerivativeMarket } = this

      return this.$route.name === 'spot-spot'
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    baseBankBalance(): BigNumberInBase {
      const { balances, currentMarket } = this

      if (!currentMarket) {
        return new BigNumberInBase('')
      }

      if (currentMarket.type === MarketType.Derivative) {
        return new BigNumberInBase('')
      }

      const spotMarket = currentMarket as UiSpotMarketWithToken

      if (!balances[spotMarket.baseDenom]) {
        return new BigNumberInBase('')
      }

      return new BigNumberInWei(balances[spotMarket.baseDenom] || 0).toBase(
        spotMarket.baseToken.decimals
      )
    },

    quoteBankBalance(): BigNumberInBase {
      const { balances, currentMarket } = this

      if (!currentMarket) {
        return new BigNumberInBase('')
      }

      if (!balances[currentMarket.quoteDenom]) {
        return new BigNumberInBase('')
      }

      return new BigNumberInWei(balances[currentMarket.quoteDenom] || 0).toBase(
        currentMarket.quoteToken.decimals
      )
    },

    baseTradingBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, currentMarket } = this

      if (
        !subaccount ||
        !currentMarket ||
        currentMarket.type === MarketType.Derivative
      ) {
        return undefined
      }

      const baseBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() ===
          (currentMarket as UiSpotMarketWithToken).baseDenom.toLowerCase()
      )

      return {
        totalBalance: baseBalance ? baseBalance.totalBalance : '0',
        availableBalance: baseBalance ? baseBalance.availableBalance : '0'
      }
    },

    quoteTradingBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, currentMarket } = this

      if (!subaccount || !currentMarket) {
        return undefined
      }

      const quoteBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === currentMarket.quoteDenom.toLowerCase()
      )

      return {
        totalBalance: quoteBalance ? quoteBalance.totalBalance : '0',
        availableBalance: quoteBalance ? quoteBalance.availableBalance : '0'
      }
    },

    hasBankBalances(): boolean {
      const { baseBankBalance, quoteBankBalance } = this

      return !(baseBankBalance.isNaN() && quoteBankBalance.isNaN())
    },

    hasTradingAccountBalances(): boolean {
      const { baseTradingBalance, quoteTradingBalance, currentMarket } = this

      if (!currentMarket) {
        return false
      }

      if (currentMarket.type === MarketType.Derivative) {
        return new BigNumberInBase(
          quoteTradingBalance ? quoteTradingBalance.availableBalance : 0
        ).gt(0)
      }

      return (
        new BigNumberInBase(
          quoteTradingBalance ? quoteTradingBalance.availableBalance : 0
        ).gt(0) ||
        new BigNumberInBase(
          baseTradingBalance ? baseTradingBalance.availableBalance : 0
        ).gt(0)
      )
    },

    hubBridgeUrl(): string {
      return `${getHubUrl()}/bridge`
    }
  },

  methods: {
    handleClickOnButton() {}
  }
})
</script>
