<template>
  <v-panel class="w-full">
    <div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-gray-500 flex items-center uppercase">
          {{ $t('marketPage.assets') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('marketPage.assetsNote')"
          />
        </p>
        <nuxt-link
          :to="{ name: 'funding' }"
          class="text-primary-500 text-2xs font-semibold"
        >
          {{ $t('marketPage.funding') }}
        </nuxt-link>
      </div>
      <div v-if="isUserWalletConnected && currentMarket" class="mt-4 relative">
        <VHocLoading :status="status">
          <div>
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
            <v-onboard
              v-if="!hasMadeAnyTransfers || !hasAnyBankBalances"
              class="mt-6"
            ></v-onboard>
          </div>
        </VHocLoading>
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

type CurrentMarket =
  | UiSpotMarketWithToken
  | UiDerivativeMarketWithToken
  | undefined

export default Vue.extend({
  components: {
    VSubaccountBalance,
    VOnboard
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
