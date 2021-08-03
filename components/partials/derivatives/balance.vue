<template>
  <v-panel :title="$t('injective_chain_balance')" class="h-full relative">
    <div v-if="!isUserWalletConnected" class="w-full h-full">
      <v-ui-overlay :shadow="false">
        <p class="text-center">{{ $t('not_connected_balances') }}</p>
      </v-ui-overlay>
    </div>
    <div v-if="isUserWalletConnected && market" class="px-4 mt-2">
      <v-ui-text-info
        class="mt-3"
        :title="$t('balance_asset', { asset: market.quoteToken.symbol })"
      >
        <v-ui-format-amount
          class="font-normal text-sm"
          v-bind="{
            value: quoteTokenBalance
          }"
        />
      </v-ui-text-info>
    </div>
    <div v-if="isUserWalletConnected" slot="title-context">
      <div class="flex items-center">
        <v-ui-button xs primary text @click.stop="openTransferModal">{{
          $t('deposit')
        }}</v-ui-button>
        <div class="mx-2 w-px h-4 bg-dark-500"></div>
        <v-ui-button xs primary text @click.stop="openTakeOutModal">{{
          $t('withdraw')
        }}</v-ui-button>
      </div>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BankBalances, Modal, UiDerivativeMarket } from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    quoteTokenBalance(): BigNumberInBase {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!balances[market.quoteDenom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balances[market.quoteDenom] || 0).toBase(
        market.quoteToken.decimals
      )
    }
  },

  methods: {
    openTransferModal() {
      this.$accessor.modal.openModal(Modal.Transfer)
    },

    openTakeOutModal() {
      this.$accessor.modal.openModal(Modal.TakeOut)
    }
  }
})
</script>
