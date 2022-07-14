<template>
  <div>
    <div class="mb-4 flex justify-between items-center flex-wrap gap-4">
      <VSearch
        dense
        name="search"
        class="sm:max-w-xs"
        data-cy="universal-table-filter-by-asset-input"
        :placeholder="$t('portfolio.filter')"
        :search="search"
        @searched="handleInputOnSearch"
      />

      <div class="ml-auto flex items-center gap-4">
        <VCheckbox v-model="showMarginCurrencyOnly">
          <span
            class="flex items-center"
            data-cy="trading-account-show-margin-only-check-box"
          >
            {{ $t('portfolio.showMarginCurrencyOnly') }}
          </span>
        </VCheckbox>
        <VCheckbox
          v-model="hideSmallBalance"
          data-cy="universal-table-hide-small-balances-check-box"
        >
          <span class="flex items-center">
            {{ $t('portfolio.hideSmallBalances') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('portfolio.hideSmallBalancesTooltip')"
            />
          </span>
        </VCheckbox>
      </div>
    </div>
    <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
      <TableHeader
        v-if="isUserWalletConnected && sortedBalances.length > 0"
        class="md:hidden xl:grid"
      >
        <div class="col-span-5 grid grid-cols-5 gap-4">
          <span>
            {{ $t('portfolio.asset') }}
          </span>
          <span class="col-span-2 flex items-center justify-end">
            <span>
              {{ $t('portfolio.total') }}
            </span>
            <IconInfoTooltip
              class="ml-2"
              color="text-gray-200"
              :tooltip="$t('portfolio.totalTooltip')"
              lg
            />
          </span>
          <span class="col-span-2 flex items-center justify-end">
            {{ $t('portfolio.available') }}
            <IconInfoTooltip
              class="ml-2"
              color="text-gray-200"
              :tooltip="$t('portfolio.availableTooltip')"
              lg
            />
          </span>
        </div>
        <div class="col-span-7 grid grid-cols-9 gap-4">
          <span class="col-span-2 flex items-center justify-end">
            {{ $t('portfolio.marginHold') }}
            <IconInfoTooltip
              class="ml-2"
              color="text-gray-200"
              :tooltip="$t('portfolio.marginHoldTooltip')"
              lg
            />
          </span>
          <span class="col-span-2 flex items-center justify-end">
            <span>
              {{ $t('trade.unrealized_pnl') }}
            </span>
            <IconInfoTooltip
              class="ml-2"
              color="text-gray-200"
              :tooltip="$t('portfolio.unrealizedPnlTooltip')"
              lg
            />
          </span>
          <span class="col-span-3 text-right">
            {{ $t('common.value') }}
          </span>
          <span class="col-span-2"></span>
        </div>
      </TableHeader>

      <TableBody
        v-if="isUserWalletConnected"
        :show-empty="sortedBalances.length === 0"
      >
        <Balance
          v-for="(balance, index) in sortedBalances"
          :key="`balance-${index}`"
          class="col-span-1"
          :balance="balance"
          :hide-balance="hideBalance"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-5">
            <div class="grow m-auto text-center py-8">
              <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
              <p>{{ $t('portfolio.empty') }}</p>
            </div>
          </span>
        </template>
      </TableBody>
      <UserWalletConnectWarning v-else cta />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { INJECTIVE_DENOM } from '@injectivelabs/sdk-ui-ts'
import Balance from './balance.vue'
import { SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } from '~/types'
import VSearch from '~/components/elements/search.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import {
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID,
  ETH_COIN_GECKO_ID
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    Balance,
    VSearch
  },

  props: {
    hideBalance: {
      type: Boolean,
      default: false
    },

    subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd: {
      required: true,
      type: Array as PropType<
        SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd[]
      >
    }
  },

  data() {
    return {
      search: '',
      hideSmallBalance: false,
      showMarginCurrencyOnly: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    filteredBalances(): SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd[] {
      const {
        subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd,
        search,
        hideSmallBalance,
        showMarginCurrencyOnly
      } = this

      return subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd.filter(
        ({ token, totalBalanceInUsd }) => {
          if (
            (!search || search.trim() === '') &&
            !hideSmallBalance &&
            !showMarginCurrencyOnly
          ) {
            return true
          }

          const symbol = token.symbol.toLowerCase().trim()

          const isPartOfSearchFilter = symbol.includes(
            search.toLowerCase().trim()
          )
          const isNotSmallBalance =
            !hideSmallBalance ||
            new BigNumberInBase(totalBalanceInUsd).gte('10')

          const isMarginCurrency =
            !showMarginCurrencyOnly ||
            [ETH_COIN_GECKO_ID, UST_COIN_GECKO_ID, USDT_COIN_GECKO_ID].includes(
              token.coinGeckoId
            )

          return isPartOfSearchFilter && isNotSmallBalance && isMarginCurrency
        }
      )
    },

    sortedBalances(): SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd[] {
      const { filteredBalances } = this

      return [...filteredBalances].sort(
        (
          v1: SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd,
          v2: SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
        ) => {
          const v1balance = new BigNumberInBase(v1.totalBalanceInUsd)
          const v2balance = new BigNumberInBase(v2.totalBalanceInUsd)

          // sort by balanceInUsd
          if (v1balance.gt(0) || v2balance.gt(0)) {
            return v2balance.minus(v1balance).toNumber()
          }

          // sort alphabetically - sort INJ to the top
          if (v1.denom === INJECTIVE_DENOM && v1balance.eq(0)) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM && v2balance.eq(0)) {
            return 1
          }

          return v1.token.symbol.localeCompare(v2.token.symbol)
        }
      )
    }
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    }
  }
})
</script>
