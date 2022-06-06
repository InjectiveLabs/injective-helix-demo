<template>
  <TableRow
    md
    class="text-sm md:grid-cols-2 xl:grid-cols-12"
    :data-cy="'trading-account-table-row-' + balance.token.symbol"
  >
    <div class="col-span-2 xl:col-span-5 grid grid-cols-2 xl:grid-cols-5 gap-4">
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.asset') }}
      </span>
      <span class="text-right xl:text-left">
        <div class="flex items-center justify-end xl:justify-start">
          <div v-if="balance.token.logo" class="w-6 h-6">
            <img
              :src="balance.token.logo"
              :alt="balance.token.name"
              class="min-w-full h-auto rounded-full"
            />
          </div>
          <div class="ml-3">
            <span
              class="text-gray-200 font-bold"
              data-cy="trading-account-token-symbol-table-data"
            >
              {{ balance.token.symbol }}
            </span>
          </div>
        </div>
      </span>
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.total') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right justify-end xl:flex items-center"
        data-cy="trading-account-total-table-data"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else>{{ totalBalanceToString }}</span>
      </span>
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.available') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
        data-cy="trading-account-available-table-data"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else>{{ availableBalanceToString }}</span>
      </span>
    </div>

    <div class="col-span-2 xl:col-span-7 grid grid-cols-2 xl:grid-cols-9 gap-4">
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.marginHold') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
        data-cy="trading-account-margin-hold-table-data"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else-if="!marginHold.eq(0)">{{ marginHoldToString }}</span>
        <span v-else>&mdash;</span>
      </span>

      <span class="font-mono text-left xl:hidden">
        {{ $t('trade.unrealized_pnl') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
        data-cy="trading-account-pnl-table-data"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else-if="!balance.pnlInUsd.eq(0)">
          {{ unrealizedPnlToString }}
        </span>
        <span v-else>&mdash;</span>
      </span>

      <span class="font-mono text-left xl:hidden">
        {{ $t('common.value') }}
      </span>
      <span class="xl:col-span-3 font-mono whitespace-nowrap text-right" data-cy="trading-account-value-table-data">
        <span v-if="hideBalance">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <span v-else class="flex items-end justify-end flex-col">
          <span
            class="leading-4"
            data-cy="trading-account-value-usd-table-data"
          >
            {{ totalBalanceInUsdToString }} USD
          </span>
          <span
            v-if="totalBalanceInBtc.gt(0)"
            class="text-opacity-50 text-gray-200 text-2xs xs:ml-1 leading-4"
            data-cy="trading-account-value-btc-table-data"
          >
            ≈ {{ totalBalanceInBtcToString }} BTC
          </span>
        </span>
      </span>
      <div
        class="col-span-2 text-right text-primary-500 text-sm flex justify-around sm:justify-end items-center"
      >
        <nuxt-link
          v-if="spotMarketRoute"
          class="cursor-pointer"
          data-cy="trading-account-trade-link"
          :to="{ name: 'spot-spot', params: { spot: spotMarketRoute } }"
        >
          <span>
            {{ $t('common.trade') }}
          </span>
        </nuxt-link>

        <span
          class="cursor-pointer ml-6"
          data-cy="trading-account-transfer-link"
          @click="handleTransferClick"
        >
          {{ $t('common.transfer') }}
        </span>
      </div>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { INJECTIVE_DENOM, ZERO_IN_BASE } from '@injectivelabs/ui-common'
import { SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } from '~/types'
import TableRow from '~/components/elements/table-row.vue'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { spot as allowedSpotMarkets } from '~/routes.config'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    balance: {
      required: true,
      type: Object as PropType<SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd>
    },

    hideBalance: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      allowedSpotMarkets,
      HIDDEN_BALANCE_DISPLAY,
      INJECTIVE_DENOM
    }
  },

  computed: {
    btcUsdPrice(): number {
      return this.$accessor.token.btcUsdPrice
    },

    availableBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.availableBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance).toBase(
        balance.token.decimals
      )
    },

    marginHold(): BigNumberInBase {
      const { balance } = this

      return balance.margin.plus(balance.inOrderBalance)
    },

    totalBalanceInBtc(): BigNumberInBase {
      const { balance, btcUsdPrice } = this

      if (!balance.totalBalanceInUsd || !btcUsdPrice) {
        return ZERO_IN_BASE
      }

      return balance.totalBalanceInUsd.dividedBy(
        new BigNumberInBase(btcUsdPrice)
      )
    },

    totalBalanceToString(): string {
      const { balance } = this

      return balance.totalBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableBalanceToString(): string {
      const { availableBalance } = this

      return availableBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    marginHoldToString(): string {
      const { marginHold } = this

      return marginHold.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    unrealizedPnlToString(): string | undefined {
      const { balance } = this

      return balance.pnlInUsd.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalBalanceInUsdToString(): string {
      const { balance } = this

      return balance.totalBalanceInUsd.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalBalanceInBtcToString(): string {
      const { totalBalanceInBtc } = this

      if (totalBalanceInBtc.eq('0')) {
        return '0.00'
      }

      if (totalBalanceInBtc.lte('0.0001')) {
        return '<0.0001'
      }

      return totalBalanceInBtc.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    spotMarketRoute(): string | undefined {
      const { allowedSpotMarkets, balance } = this

      const route = allowedSpotMarkets.find((marketRoute) => {
        return marketRoute.startsWith(balance.token.symbol.toLowerCase())
      })

      return route
    }
  },

  methods: {
    handleTransferClick() {
      const { balance } = this

      this.$root.$emit('bridge:transfer-to-bank', balance.token)
    }
  }
})
</script>
