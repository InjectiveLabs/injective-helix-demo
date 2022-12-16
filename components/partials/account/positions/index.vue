<template>
  <div>
    <Actions
      :market-denom="marketDenom"
      :market-options="marketOptions"
      :side="side"
      :side-options="sideOptions"
      @update:market-denom="handleMarketDenomChange"
      @update:side="handleSideChange"
      @close-all-positions="handleCloseAllPositions"
    />

    <table class="w-full border-collapse hidden lg:table">
      <TableHeader />

      <TableRow
        v-for="(position, i) in filteredPositions"
        :key="i"
        :position="position"
        :hide-balances="hideBalances"
      />
    </table>

    <table class="w-full border-collapse table lg:hidden">
      <TableRowMobile
        v-for="(position, i) in filteredPositions"
        :key="i"
        class=""
        :position="position"
        :hide-balances="hideBalances"
      />
    </table>

    <EmptyList
      v-if="showEmpty"
      classes="bg-gray-850 min-h-3xs"
      data-cy="markets-no-data-table"
      :message="$t('account.positions.empty')"
    >
      <span class="mt-2 text-xs text-gray-500">
        {{ $t('account.positions.empty') }}
      </span>
    </EmptyList>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BankBalanceWithTokenAndBalanceInBase,
  UiDerivativeMarketWithToken,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import TableHeader from './table-header.vue'
import TableRow from './table-row.vue'
import TableRowMobile from './table-row-mobile.vue'
import Actions from '~/components/partials/account/positions/actions.vue'

export default Vue.extend({
  components: {
    Actions,
    TableHeader,
    TableRow,
    TableRowMobile
  },

  props: {
    hideBalances: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      marketDenom: '',
      side: '',
      sideOptions: [
        {
          label: this.$t('account.positions.side.all'),
          value: ''
        },
        {
          label: this.$t('account.positions.side.short'),
          value: 'short'
        },
        {
          label: this.$t('account.positions.side.long'),
          value: 'long'
        }
      ]
    }
  },

  computed: {
    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    marketId(): string | undefined {
      const { markets, marketDenom } = this

      if (marketDenom === '') {
        return undefined
      }

      return markets.find((m) => {
        return (
          m.baseToken.denom === marketDenom ||
          m.quoteToken.denom === marketDenom
        )
      })?.marketId
    },

    filteredPositions(): UiPosition[] {
      const { positions, marketId, side } = this

      return positions.filter((position) => {
        if (side === '' && marketId === undefined) {
          return true
        }

        const matchSide = position.direction === side
        const matchMarketId = position.marketId === marketId

        if (side === '' && marketId) {
          return matchMarketId
        }

        if (side !== '' && marketId === undefined) {
          return matchSide
        }

        return matchSide && matchMarketId
      })
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      const { markets } = this

      const tokens = markets.reduce((list, market) => {
        const baseToken = {
          balance: '',
          denom: market.baseToken.denom,
          token: market.baseToken
        } as BankBalanceWithTokenAndBalanceInBase

        const quoteToken = {
          balance: '',
          denom: market.quoteToken.denom,
          token: market.quoteToken
        } as BankBalanceWithTokenAndBalanceInBase

        return [...list, baseToken, quoteToken]
      }, [] as BankBalanceWithTokenAndBalanceInBase[])

      const uniqueTokens = [
        ...new Map(tokens.map((token) => [token.denom, token])).values()
      ]

      return uniqueTokens
    },

    marketOptions(): Object[] {
      const { supportedTokens } = this

      return [
        {
          label: this.$t('account.positions.market.all'),
          value: ''
        },
        ...supportedTokens.map(({ token }) => {
          return {
            label: token.symbol,
            value: token.denom
          }
        })
      ]
    },

    showEmpty(): boolean {
      const { markets, filteredPositions } = this

      if (filteredPositions.length === 0) {
        return true
      }

      const hasUnavailableMarkets = filteredPositions.every(
        (position) =>
          markets.findIndex((m) => m.marketId === position.marketId) === -1
      )

      return hasUnavailableMarkets
    }
  },

  methods: {
    handleMarketDenomChange(value: string) {
      this.marketDenom = value
    },

    handleSideChange(value: string) {
      this.side = value
    },

    handleCloseAllPositions() {
      const { positions } = this

      return positions.length === 1
        ? this.closePosition()
        : this.closeAllPositions()
    },

    closeAllPositions() {
      const { positions } = this

      return this.$accessor.positions
        .closeAllPosition(positions)
        .then(() => {
          this.$toast.success(this.$t('trade.positions_closed'))
        })
        .catch(this.$onRejected)
    },

    closePosition() {
      const { positions, markets } = this
      const [position] = positions

      const market = markets.find((m) => m.marketId === position.marketId)

      if (!market) {
        throw new GeneralException(
          Error(
            this.$t('trade.position_market_not_found', {
              marketId: position.marketId
            })
          )
        )
      }

      return this.$accessor.positions
        .closePosition({
          position,
          market
        })
        .then(() => {
          this.$toast.success(this.$t('trade.positions_closed'))
        })
        .catch(this.$onRejected)
    }
  }
})
</script>
