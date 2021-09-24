<template>
  <v-panel>
    <div>
      <div>
        <div class="flex items-center justify-between">
          <p
            class="uppercase text-2xs text-gray-400 font-semibold tracking-wider flex items-center"
          >
            {{ $t('Injective Chain') }}
          </p>
          <div class="flex items-center">
            <v-ui-button xs primary text @click.stop="openBridgeDepositModal">{{
              $t('deposit')
            }}</v-ui-button>
            <div class="mx-2 w-px h-4 bg-dark-500"></div>
            <v-ui-button xs primary text @click.stop="openWithdrawModal">{{
              $t('withdraw')
            }}</v-ui-button>
          </div>
        </div>
        <div class="mt-4">
          <v-bank v-if="isUserWalletConnected" :market="currentMarket" />
          <v-user-wallet-connect-warning v-else />
        </div>
      </div>
      <div class="mt-6">
        <div class="flex items-center justify-between">
          <p
            class="uppercase text-2xs text-gray-400 font-semibold tracking-wider flex items-center"
          >
            {{ $t('Subaccount') }}
          </p>
          <div class="flex items-center">
            <v-ui-button
              xs
              primary
              text
              @click.stop="openSubaccountTransferModal"
              >{{ $t('deposit') }}</v-ui-button
            >
            <div class="mx-2 w-px h-4 bg-dark-500"></div>
            <v-ui-button
              xs
              primary
              text
              @click.stop="openSubaccountWithdrawModal"
              >{{ $t('withdraw') }}</v-ui-button
            >
          </div>
        </div>
        <div class="mt-4">
          <v-subaccount-balances
            v-if="isUserWalletConnected"
            :market="currentMarket"
          />
          <v-user-wallet-connect-warning v-else />
        </div>
      </div>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import VBank from './bank.vue'
import VSubaccountBalances from './subaccount.vue'
import { Modal, UiDerivativeMarket, UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    VBank,
    VSubaccountBalances
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    currentSpotMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    currentMarket(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { currentSpotMarket, currentDerivativeMarket } = this

      return this.$route.name === 'spott-spot' // TODO
        ? currentSpotMarket
        : currentDerivativeMarket
    }
  },

  methods: {
    openBridgeDepositModal() {
      this.$accessor.modal.openModal(Modal.BridgeDeposit)
    },

    openWithdrawModal() {
      this.$accessor.modal.openModal(Modal.BridgeWithdraw)
    },

    openSubaccountTransferModal() {
      this.$accessor.modal.openModal(Modal.SubaccountDeposit)
    },

    openSubaccountWithdrawModal() {
      this.$accessor.modal.openModal(Modal.SubaccountWithdraw)
    }
  }
})
</script>
