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
      <div v-if="isUserWalletConnected" class="relative">
        <HOCLoading :status="status">
          <div v-if="currentMarket" class="mt-2">
            <div v-if="!hasAnyBankBalances">
              <p class="text-xs text-gray-500">
                {{ $t('marketPage.noChainBalance') }}
              </p>
            </div>
            <v-subaccount-balance
              v-if="hasAnyBankBalances"
              v-bind="{
                baseTradingBalance,
                quoteTradingBalance,
                market: currentMarket
              }"
            />
            <v-onboard class="mt-6"></v-onboard>
          </div>
        </HOCLoading>
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
  UiSubaccount,
  UiSubaccountBalanceWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import VSubaccountBalance from './subaccount.vue'
import VOnboard from './onboard.vue'
import { getHubUrl } from '~/app/utils/helpers'
import HOCLoading from '~/components/hoc/loading.vue'

type CurrentMarket =
  | UiSpotMarketWithToken
  | UiDerivativeMarketWithToken
  | undefined

export default Vue.extend({
  components: {
    VSubaccountBalance,
    VOnboard,
    HOCLoading
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    hasMadeAnyTransfers(): boolean {
      return this.$accessor.onboard.hasMadeAnyTransfers
    },

    hasMadeAnyTrades(): boolean {
      return this.$accessor.onboard.hasMadeAnyTrades
    },

    hasAnyBankBalances(): boolean {
      return this.$accessor.bank.hasAnyBankBalance
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

  mounted() {
    Promise.all([this.$accessor.onboard.init()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
