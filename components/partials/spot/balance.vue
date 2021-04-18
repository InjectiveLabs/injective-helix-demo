<template>
  <v-panel
    :title="$t('funds_available')"
    :class="{ 'wallet-not-connected': !isUserWalletConnected }"
    overflow="overflow-hidden"
    class="h-full relative"
  >
    <div v-if="!isUserWalletConnected" class="w-full h-full">
      <v-ui-overlay :shadow="false">
        <p class="text-center">{{ $t('not_connected_balances') }}</p>
      </v-ui-overlay>
    </div>
    <div
      v-if="isUserWalletConnected && balances.length > 0"
      class="table-compact"
    >
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th is="v-ui-table-th" class="w-1/3" left>
                <span>{{ $t('asset') }}</span>
              </th>
              <th is="v-ui-table-th" class="w-1/3" right>
                <span>{{ $t('balance') }}</span>
              </th>
              <th is="v-ui-table-th" class="w-1/3" right>
                <span>{{ $t('available') }}</span>
              </th>
              <th is="v-ui-table-th" class="w-1/3" center>
                <span>{{ $t('transfer') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="balance in balances" :key="`balance-${balance.denom}`">
              <td is="v-ui-table-td">
                <div class="flex items-center">
                  <img
                    :src="balance.token.name"
                    :alt="balance.token.icon"
                    class="w-6 h-6 mr-4"
                  />
                  <div class="leading-none">
                    <p class="text-gray-100 font-semibold text-sm">
                      {{ balance.token.symbol }}
                    </p>
                    <p class="text-gray-500 text-xs">
                      {{ balance.token.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td is="v-ui-table-td" xs right>
                <div class="flex items-center">
                  <v-ui-format-number
                    v-bind="{
                      value: balance.totalBalance.toBase(
                        balance.token.decimals
                      ),
                      decimals: balance.displayDecimals
                    }"
                  />
                </div>
              </td>
              <td is="v-ui-table-td" xs right>
                <div class="flex items-center">
                  <v-ui-format-number
                    v-bind="{
                      value: balance.availableBalance.toBase(
                        balance.token.decimals
                      ),
                      decimals: balance.displayDecimals
                    }"
                  />
                </div>
              </td>
              <td is="v-ui-table-td" xs center>
                <v-ui-button xs primary @click.stop="openTransferModal">{{
                  $t('transfer')
                }}</v-ui-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="flex h-full items-center justify-center">
      <v-ui-button sm primary @click.stop="openTransferModal">{{
        $t('transfer')
      }}</v-ui-button>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  Modal,
  UiSpotMarket,
  UiSubaccount,
  UiSubaccountBalanceToBN
} from '~/types'

export default Vue.extend({
  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    balances(): UiSubaccountBalanceToBN[] {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return []
      }

      const quoteBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.baseDenom.toLowerCase()
      )!
      const baseBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteDenom.toLowerCase()
      )!

      const balances = [baseBalance, quoteBalance]

      return balances
        .filter((b) => b)
        .map((balance) => ({
          ...balance,
          displayDecimals:
            market.baseDenom.toLowerCase() === balance.denom.toLowerCase()
              ? market.maxQuantityScaleDecimals
              : market.maxPriceScaleDecimals,
          totalBalance: new BigNumberInWei(balance.totalBalance),
          availableBalance: new BigNumberInWei(balance.availableBalance)
        }))
    }
  },

  methods: {
    openTransferModal() {
      this.$accessor.modal.openModal(Modal.Transfer)
    }
  }
})
</script>
