<template>
  <tr
    class="border-b border-gray-600 last-of-type:border-b-transparent hover:bg-helixGray-600 bg-transparent overflow-hidden gap-2 transition-all"
    :class="{ 'max-h-20': !isOpen, 'max-h-screen': isOpen }"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
    @click="handleOpenAssetDetailsModal"
  >
    <td class="no-padding">
      <div class="flex flex-col py-4 pl-4">
        <div class="flex justify-start items-center gap-2">
          <div class="w-6 h-6 rounded-full self-start">
            <img :src="tokenLogo" :alt="balance.token.name" />
          </div>

          <div class="flex flex-col gap-1">
            <span
              class="text-white font-bold tracking-wide text-sm uppercase h-6 flex items-center"
              data-cy="wallet-balance-token-symbol-table-data"
            >
              {{ balance.token.symbol }}
            </span>
            <span class="text-gray-500 text-xs">
              {{ balance.token.name }}
            </span>
          </div>
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-total-table-data">
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ combinedBalanceToString }}
            </span>
          </div>

          <div>
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }} USD
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ totalBalanceInUsdToString }} USD
            </span>
          </div>
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex items-center justify-end px-4">
        <IconChevron class="text-blue-300 w-4 h-4 rotate-180" />
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  getTokenLogoWithVendorPathPrefix,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { AccountBalance, Modal } from '~/types'

export default Vue.extend({
  props: {
    balance: {
      type: Object as PropType<AccountBalance>,
      required: true
    },

    hideBalances: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      HIDDEN_BALANCE_DISPLAY,
      isOpen: false
    }
  },

  computed: {
    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    filteredMarkets(): UiSpotMarketWithToken[] {
      const { markets, balance } = this

      return markets.filter(
        (m) =>
          m.baseDenom === balance.token.denom ||
          m.quoteDenom === balance.token.denom
      )
    },

    tokenLogo(): string {
      const { balance } = this

      return getTokenLogoWithVendorPathPrefix(balance.token.logo)
    },

    totalBalance(): BigNumberInBase {
      const { balance } = this

      return balance.bankBalance.plus(balance.subaccountAvailableBalance)
    },

    totalBalanceInUsd(): string {
      const { totalBalance, balance } = this

      return totalBalance
        .times(balance.token.usdPrice)
        .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    totalBalanceInUsdToString(): string {
      const { totalBalance } = this

      return totalBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    availableBalance(): BigNumberInBase {
      const { balance } = this

      return balance.subaccountAvailableBalance
    },

    availableBalanceToString(): string {
      const { availableBalance } = this

      return availableBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    combinedBalance(): BigNumberInBase {
      const { balance } = this

      return balance.bankBalance.plus(balance.subaccountAvailableBalance)
    },

    combinedBalanceToString(): string {
      const { combinedBalance } = this

      return combinedBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    inOrderBalanceToString(): string {
      const { balance } = this

      return balance.inOrderBalance.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    $popper(): any {
      return this.$refs['trade-popper']
    },

    popperOptions(): any {
      return {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    }
  },

  methods: {
    toggleOpen() {
      this.isOpen = !this.isOpen
    },

    handleShowTradeMenu() {
      const popper = this.$popper

      if (popper) {
        popper.showDropdown()
      }
    },

    handleHideTradeMenu() {
      const popper = this.$popper

      if (popper) {
        popper.hideDropdown()
      }
    },

    handleNavigateToMarket(market: UiSpotMarketWithToken) {
      this.$router.push({
        name: 'spot-spot',
        params: {
          marketId: market.marketId,
          spot: market.slug
        }
      })
    },

    handleDepositClick() {
      const { balance } = this

      this.$root.$emit('bridge:deposit', balance.token)
    },

    handleWithdrawClick() {
      const { balance } = this

      this.$root.$emit('bridge:withdraw', balance.token)
    },

    handleOpenAssetDetailsModal() {
      const { balance } = this

      this.$accessor.modal.openModal({
        type: Modal.AssetDetails,
        data: balance
      })
    }
  }
})
</script>
