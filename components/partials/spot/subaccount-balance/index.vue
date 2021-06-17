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
            <tr is="v-balance" v-if="baseBalance" :balance="baseBalance"></tr>
            <tr is="v-balance" v-if="quoteBalance" :balance="quoteBalance"></tr>
            <tr is="v-balance-empty" v-if="!quoteBalance && !baseBalance"></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="isUserWalletConnected" slot="title-context">
      <div class="flex items-center">
        <v-ui-button xs primary class="mr-2" @click.stop="openDepositModal">{{
          $t('deposit')
        }}</v-ui-button>
        <v-ui-button xs primary @click.stop="openWithdrawalModal">{{
          $t('withdraw')
        }}</v-ui-button>
      </div>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import VBalance from './balance.vue'
import VBalanceEmpty from './balance-empty.vue'
import {
  Modal,
  UiSpotMarket,
  UiSubaccount,
  UiSubaccountBalanceWithToken
} from '~/types'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VBalance,
    VBalanceEmpty
  },

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

    quoteBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return undefined
      }

      const quoteBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteDenom.toLowerCase()
      )

      return {
        totalBalance: new BigNumberInWei(
          quoteBalance ? quoteBalance.totalBalance : 0
        ),
        availableBalance: new BigNumberInWei(
          quoteBalance ? quoteBalance.availableBalance : 0
        ),
        displayDecimals: UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        token: market.quoteToken,
        denom: market.quoteDenom
      }
    },

    baseBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return undefined
      }

      const baseBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.baseDenom.toLowerCase()
      )

      return {
        totalBalance: new BigNumberInWei(
          baseBalance ? baseBalance.totalBalance : 0
        ),
        availableBalance: new BigNumberInWei(
          baseBalance ? baseBalance.availableBalance : 0
        ),
        displayDecimals: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
        token: market.baseToken,
        denom: market.baseDenom
      }
    }
  },

  methods: {
    openDepositModal() {
      this.$accessor.modal.openModal(Modal.Deposit)
    },

    openWithdrawalModal() {
      this.$accessor.modal.openModal(Modal.Withdraw)
    }
  }
})
</script>
