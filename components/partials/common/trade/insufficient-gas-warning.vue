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
  UiSubaccount,
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import InsufficientGasInner from '~/components/partials/common/elements/insufficient-gas-inner.vue'
import { INJ_TO_IBC_TRANSFER_FEE } from '~/app/utils/constants'
import { CurrentMarket } from '~/types'

export default Vue.extend({
  components: {
    InsufficientGasInner
  },

  computed: {
    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
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
      const { market, isWalletExemptFromGasFee, balance } = this

      if (
        !market ||
        market.baseToken.denom.toLowerCase() !== 'inj' ||
        isWalletExemptFromGasFee
      ) {
        return false
      }

      const transferFee = new BigNumberInBase(INJ_TO_IBC_TRANSFER_FEE)

      return balance.lt(transferFee)
    },

    balance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() ===
            market.baseToken.denom.toLowerCase() ||
          balance.denom.toLowerCase() === market.quoteToken.denom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.quoteToken.decimals
      )
    }
  }
})
</script>
