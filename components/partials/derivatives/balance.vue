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
            value: quoteTokenBalance.toBase(market.quoteToken.decimals)
          }"
        />
      </v-ui-text-info>
    </div>
    <div v-if="isUserWalletConnected" slot="title-context">
      <v-ui-button xs primary @click.stop="openTransferModal">{{
        $t('transfer')
      }}</v-ui-button>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BankBalances, Modal, UiDerivativeMarket } from '~/types'
import { ZERO_IN_WEI } from '~/app/utils/constants'

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

    quoteTokenBalance(): BigNumberInWei {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      if (!balances[market.quoteDenom]) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(balances[market.quoteDenom] || 0)
    }
  },

  methods: {
    openTransferModal() {
      this.$accessor.modal.openModal(Modal.Transfer)
    }
  }
})
</script>
