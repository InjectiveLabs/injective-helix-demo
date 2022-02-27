<template>
  <div>
    <div class="relative max-w-full">
      <VHocLoading :status="status">
        <div class="relative">
          <div class="mb-6 flex justify-between items-center flex-wrap">
            <v-search
              dense
              name="search"
              class="sm:max-w-xs"
              :placeholder="$t('balances.filter')"
              :search="search"
              @searched="handleInputOnSearch"
            />

            <v-checkbox v-model="hideSmallBalance" class="mt-4 sm:mt-0 ml-auto">
              {{ $t('balances.hideSmallBalances') }}
            </v-checkbox>
          </div>
          <div
            class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full"
          >
            <TableHeader
              v-if="isUserWalletConnected && sortedBalances.length > 0"
              class="md:hidden xl:grid"
            >
              <div class="col-span-5 grid grid-cols-5 gap-4">
                <span>
                  {{ $t('balances.asset') }}
                </span>
                <span class="col-span-2 flex items-center">
                  <div>
                    {{ $t('balances.total') }}
                  </div>
                  <v-icon-info-tooltip
                    class="ml-2"
                    color="text-gray-200"
                    :tooltip="$t('balances.totalTooltip')"
                    lg
                  />
                </span>
                <span class="col-span-2">
                  {{ $t('balances.available') }}
                </span>
              </div>
              <div class="col-span-7 grid grid-cols-9 gap-4">
                <span class="col-span-2">
                  {{ $t('balances.marginHold') }}
                </span>
                <span class="col-span-2 flex items-center">
                  <div>
                    {{ $t('trade.unrealized_pnl') }}
                  </div>
                  <v-icon-info-tooltip
                    class="ml-2"
                    color="text-gray-200"
                    :tooltip="$t('trade.unrealized_pnl_tooltip')"
                    lg
                  />
                </span>
                <span class="col-span-2">
                  {{ $t('common.value') }}
                </span>
                <span class="col-span-3"></span>
              </div>
            </TableHeader>

            <TableBody
              v-if="isUserWalletConnected"
              :show-empty="sortedBalances.length === 0"
            >
              <v-balance
                v-for="(balance, index) in sortedBalances"
                :key="`balance-${index}`"
                class="col-span-1"
                :balance="balance"
                :hide-balance="hideBalance"
                :total-positions-margin="totalPositionsMargin"
                :total-positions-pnl="totalPositionsPnl"
              />
              <template slot="empty">
                <span class="col-span-1 md:col-span-5">
                  <div class="grow m-auto text-center py-8">
                    <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
                    <p>{{ $t('balances.empty') }}</p>
                  </div>
                </span>
              </template>
            </TableBody>
            <v-user-wallet-connect-warning v-else cta />
          </div>
        </div>
      </VHocLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  SubaccountBalanceWithTokenWithUsdBalance,
  INJECTIVE_DENOM
} from '@injectivelabs/ui-common'

import VBalance from './balance.vue'
import VSearch from '~/components/elements/search.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VBalance,
    VSearch
  },

  props: {
    subaccountBalancesWithUsdBalance: {
      required: true,
      type: Array as PropType<SubaccountBalanceWithTokenWithUsdBalance[]>
    },

    totalPositionsMargin: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    totalPositionsPnl: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    hideBalance: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      search: '',
      hideSmallBalance: false,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    filteredBalances(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const {
        subaccountBalancesWithUsdBalance,
        search,
        hideSmallBalance
      } = this

      return subaccountBalancesWithUsdBalance.filter(
        ({ token, balanceInUsd }) => {
          if ((!search || search.trim() === '') && !hideSmallBalance) {
            return true
          }

          const symbol = token.symbol.toLowerCase().trim()
          const isINJ = symbol === INJECTIVE_DENOM

          const isPartOfSearchFilter = symbol.includes(
            search.toLowerCase().trim()
          )
          const isNotSmallBalance =
            !hideSmallBalance ||
            isINJ ||
            new BigNumberInBase(balanceInUsd).gte('10')

          return isPartOfSearchFilter && isNotSmallBalance
        }
      )
    },

    // sort INJ to the top
    sortedBalances(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const { filteredBalances } = this

      return [...filteredBalances].sort(
        (
          v1: SubaccountBalanceWithTokenWithUsdBalance,
          v2: SubaccountBalanceWithTokenWithUsdBalance
        ) => {
          if (v1.denom === INJECTIVE_DENOM) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM) {
            return 1
          }

          return new BigNumberInBase(v2.balanceInUsd)
            .minus(v1.balanceInUsd)
            .toNumber()
        }
      )
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.account.fetchSubaccountsBalancesWithPrices()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.positions.fetchMarketsOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        //
      })
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    }
  }
})
</script>
