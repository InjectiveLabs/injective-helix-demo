<template>
  <div
    v-if="showInsufficientFundsWarning"
    class="bg-helixGray-950 rounded-lg mb-1 p-6"
  >
    <InsufficientGasInner />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  BankBalances
} from '@injectivelabs/sdk-ui-ts'
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import InsufficientGasInner from '~/components/partials/common/elements/insufficient-gas-inner.vue'
import { INJ_GAS_BUFFER } from '~/app/utils/constants'
import { CurrentMarket } from '~/types'
import { injToken } from '~/app/data/token'

export default Vue.extend({
  components: {
    InsufficientGasInner
  },

  computed: {
    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    currentSpotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    market(): CurrentMarket {
      const { currentSpotMarket, currentDerivativeMarket } = this

      return this.$route.name === 'spot-spot'
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    isWalletExemptFromGasFee(): boolean {
      const { wallet } = this

      return !isCosmosWallet(wallet)
    },

    showInsufficientFundsWarning(): boolean {
      const { market, isWalletExemptFromGasFee, hasSufficientBalance } = this

      if (!market || isWalletExemptFromGasFee) {
        return false
      }

      return !hasSufficientBalance
    },

    balance(): BigNumberInBase {
      const { bankBalances } = this

      const injBalance = bankBalances[injToken.denom || INJ_DENOM]

      if (!injBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(injBalance).toBase(injToken.decimals)
    },

    hasSufficientBalance(): boolean {
      const { balance } = this

      return balance.gt(new BigNumberInBase(INJ_GAS_BUFFER))
    }
  }
})
</script>
