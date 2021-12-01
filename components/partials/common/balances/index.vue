<template>
  <v-panel class="w-full">
    <div>
      <div>
        <div class="flex items-center justify-between">
          <p class="text-2xs text-gray-300 flex items-center">
            {{ $t('Injective Chain') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('injective_chain_tooltip')"
            />
          </p>
          <div v-if="!isIbcDenom" class="flex items-center">
            <v-button text-xs primary @click.stop="openBridgeDepositModal">
              {{ $t('deposit') }}
            </v-button>
            <div class="mx-2 w-px h-4 bg-gray-500"></div>
            <v-button text-xs primary @click.stop="openWithdrawModal">
              {{ $t('withdraw') }}
            </v-button>
          </div>
          <div v-else class="flex items-center">
            <v-button text-xs primary>
              <a :href="hubBridgeUrl" target="_blank">{{ $t('deposit') }}</a>
            </v-button>
            <div class="mx-2 w-px h-4 bg-gray-500"></div>
            <v-button text-xs primary>
              <a :href="hubBridgeUrl" target="_blank">{{ $t('withdraw') }}</a>
            </v-button>
          </div>
        </div>
        <div class="mt-4">
          <v-bank v-if="isUserWalletConnected" :market="currentMarket" />
          <v-user-wallet-connect-warning v-else />
        </div>
      </div>
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <p class="text-2xs text-gray-300 flex items-center">
            {{ $t('Subaccount') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('subaccount_tooltip')"
            />
          </p>
          <div class="flex items-center">
            <v-button primary text-xs @click.stop="openSubaccountTransferModal">
              {{ $t('deposit') }}
            </v-button>
            <div class="mx-2 w-px h-4 bg-gray-500"></div>
            <v-button primary text-xs @click.stop="openSubaccountWithdrawModal">
              {{ $t('withdraw') }}
            </v-button>
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
import { MarketType, Modal, UiDerivativeMarket, UiSpotMarket } from '~/types'
import { getHubUrl } from '~/app/utils/testnet'

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

      return this.$route.name === 'spot-spot'
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    isIbcDenom(): boolean {
      const { currentMarket } = this

      if (!currentMarket) {
        return false
      }

      if (currentMarket.type === MarketType.Spot) {
        return (
          (currentMarket as UiSpotMarket).baseDenom.startsWith('ibc') ||
          (currentMarket as UiSpotMarket).quoteDenom.startsWith('ibc')
        )
      }

      // Derivative
      return currentMarket.quoteDenom.startsWith('ibc')
    },

    hubBridgeUrl(): string {
      return `${getHubUrl()}/bridge`
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
