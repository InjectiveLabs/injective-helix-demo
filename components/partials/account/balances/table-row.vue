<template>
  <tr
    class="border-b border-gray-600 last-of-type:border-b-transparent hover:bg-helixGray-600 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all"
    :class="{ 'max-h-20': !isOpen, 'max-h-screen': isOpen }"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
  >
    <td class="pl-4">
      <div class="flex justify-start items-center gap-2">
        <div class="w-6 h-6 rounded-full self-center">
          <img :src="tokenLogo" :alt="balance.token.name" />
        </div>

        <div class="flex justify-start gap-2 items-center">
          <span
            class="text-white font-bold tracking-wide text-sm uppercase h-auto flex items-center"
            data-cy="wallet-balance-token-symbol-table-data"
          >
            {{ balance.token.symbol }}
          </span>
          <span class="text-gray-500 text-xs">
            {{ balance.token.name }}
          </span>
        </div>
      </div>
    </td>

    <td>
      <div class="flex justify-end" data-cy="wallet-balance-total-table-data">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ combinedBalanceToString }}
        </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ availableBalanceToString }}
        </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ inOrderBalanceToString }}
        </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ totalBalanceInUsdToString }} USD
        </span>
      </div>
    </td>

    <td class="pr-4">
      <div
        class="flex items-center justify-end gap-4 col-start-2 col-span-2 col-auto"
      >
        <div
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          data-cy="wallet-balance-deposit-link"
          @click="handleDepositClick"
        >
          <span class="text-blue-300 text-sm font-medium">
            {{ $t('account.deposit') }}
          </span>
        </div>

        <div
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          data-cy="wallet-balance-withdraw-link"
          @click="handleWithdrawClick"
        >
          <span class="text-blue-300 text-sm font-medium">
            {{ $t('account.withdraw') }}
          </span>
        </div>

        <div
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
        >
          <span
            :id="`popper-target-${balance.token.symbol}`"
            class="text-blue-300 text-sm font-medium cursor-pointer"
            @mouseenter="handleShowTradeMenu"
            @mouseleave="handleHideTradeMenu"
          >
            {{ $t('account.trade') }}
          </span>
        </div>

        <PopperBox
          ref="trade-popper"
          class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-36 bg-gray-950 shadow-dropdown"
          :options="popperOptions"
          :binding-element="`#popper-target-${balance.token.symbol}`"
        >
          <div class="flex flex-col py-2">
            <span
              v-for="market in filteredMarkets"
              :key="market.slug"
              class="px-4 py-2 font-semibold text-sm uppercase cursor-pointer text-white hover:text-blue-300"
              @click="handleNavigateToMarket(market)"
            >
              {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
            </span>
          </div>
        </PopperBox>
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
import PopperBox from '~/components/elements/popper-box.vue'
import { AccountBalance } from '~/types'

export default Vue.extend({
  components: { PopperBox },

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

      return balance.bankBalance.plus(balance.subaccountTotalBalance)
    },

    combinedBalanceToString(): string {
      const { combinedBalance } = this

      // TODO: Investigate proper solution for SOMM related markets.
      if (combinedBalance.isNaN()) {
        return '—'
      }

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
    }
  }
})
</script>
