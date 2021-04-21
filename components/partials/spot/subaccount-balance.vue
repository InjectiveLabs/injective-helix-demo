<template>
  <v-panel :title="$t('subaccount_funds_available')" class="h-full relative">
    <div v-if="!isUserWalletConnected" class="w-full h-full">
      <v-ui-overlay :shadow="false">
        <p class="text-center">{{ $t('not_connected_balances') }}</p>
      </v-ui-overlay>
    </div>
    <div v-if="isUserWalletConnected" class="table-compact">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th is="v-ui-table-th" left>
                <span>{{ $t('asset') }}</span>
              </th>
              <th is="v-ui-table-th" right>
                <span>{{ $t('available') }}</span>
              </th>
              <th is="v-ui-table-th" right>
                <span>{{ $t('balance') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="balance in balances" :key="`balance-${balance.denom}`">
              <td is="v-ui-table-td">
                <p class="text-gray-200 font-semibold text-xs">
                  {{ balance.token.symbol }}
                </p>
              </td>
              <td is="v-ui-table-td" xs right>
                <v-ui-format-number
                  v-bind="{
                    value: balance.totalBalance.toBase(balance.token.decimals),
                    decimals: balance.displayDecimals
                  }"
                />
              </td>
              <td is="v-ui-table-td" xs right>
                <v-ui-format-number
                  v-bind="{
                    value: balance.availableBalance.toBase(
                      balance.token.decimals
                    ),
                    decimals: balance.displayDecimals
                  }"
                />
              </td>
            </tr>
            <tr v-if="balances.length === 0">
              <td is="v-ui-table-td" xs right class="h-8">
                <v-ui-text muted-lg xs>&mdash;</v-ui-text>
              </td>
              <td is="v-ui-table-td" xs right class="h-8">
                <v-ui-text muted-lg xs>&mdash;</v-ui-text>
              </td>
              <td is="v-ui-table-td" xs right class="h-8">
                <v-ui-text muted-lg xs>&mdash;</v-ui-text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="isUserWalletConnected" slot="title-context">
      <v-ui-button xs primary @click.stop="openDepositModal">{{
        $t('deposit')
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
    openDepositModal() {
      this.$accessor.modal.openModal(Modal.Deposit)
    }
  }
})
</script>
