<template>
  <v-panel :title="$t('injective_chain_balance')" class="h-full relative">
    <div v-if="!isUserWalletConnected" class="w-full h-full">
      <v-ui-overlay :shadow="false">
        <p class="text-center">{{ $t('not_connected_balances') }}</p>
      </v-ui-overlay>
    </div>
    <div v-if="isUserWalletConnected && market" class="px-4 mt-2">
      <v-ui-text-info
        :title="$t('balance_asset', { asset: market.baseToken.symbol })"
      >
        <v-ui-format-amount
          class="font-normal text-sm"
          v-bind="{
            value: baseTokenBalance.toBase(market.baseToken.decimals)
          }"
        />
      </v-ui-text-info>
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
      <div class="flex items-center">
        <v-ui-button xs primary class="mr-2" @click.stop="openTransferModal">{{
          $t('deposit')
        }}</v-ui-button>
        <v-ui-button xs primary @click.stop="openTakeOutModal">{{
          $t('withdraw')
        }}</v-ui-button>
      </div>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BankBalances, Modal, UiSpotMarket } from '~/types'
import { ZERO_IN_WEI } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    baseTokenBalance(): BigNumberInWei {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      if (!balances[market.baseDenom]) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(balances[market.baseDenom] || 0)
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
    },

    openTakeOutModal() {
      this.$accessor.modal.openModal(Modal.TakeOut)
    }
  }
})
</script>
