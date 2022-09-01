<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <Toolbar>
        <template #filters>
          <div class="grid grid-cols-4 items-center gap-4 w-full">
            <SearchAsset
              class="col-span-4 sm:col-span-1"
              :value="selectedToken"
              @select="handleSearch"
            />

            <ClearFiltersButton
              v-if="showClearFiltersButton"
              @clear="handleClearFilters"
            />
          </div>
        </template>
      </Toolbar>

      <TableWrapper break-md class="mt-4">
        <table v-if="filteredTransactions.length > 0" class="table">
          <TableHeader />
          <tbody>
            <tr
              is="v-withdrawal"
              v-for="(transaction, index) in sortedTransactions"
              :key="`withdrawal-${index}-${transaction.timestamp}`"
              :transaction="transaction"
            />
          </tbody>
        </table>
        <EmptyList
          v-else
          :message="$t('walletHistory.emptyWithdrawalTransactions')"
          class="min-h-orders"
        />
      </TableWrapper>

      <!-- Enable <Pagination> once withdrawals pagination is supported in the indexer -->

      <!-- <Pagination
        v-if="status.isIdle()"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      /> -->
    </div>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  BridgeTransactionState,
  UiBridgeTransactionWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import VWithdrawal from './withdrawal.vue'
import TableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'
import Toolbar from '~/components/partials/activity/common/toolbar.vue'
import SearchAsset from '~/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '~/components/partials/activity/common/clear-filters-button.vue'
// import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableHeader,
    VWithdrawal,
    Toolbar,
    SearchAsset,
    ClearFiltersButton
    // Pagination
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading),
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    transactions(): UiBridgeTransactionWithToken[] {
      return this.$accessor.bridge.withdrawalTransactions
    },

    filteredTransactions(): UiBridgeTransactionWithToken[] {
      const { transactions, search } = this

      return transactions.filter((transaction) => {
        const isCompletedTransaction =
          transaction.state === BridgeTransactionState.Completed

        if (!search && isCompletedTransaction) {
          return true
        }

        const isPartOfSearchFilter = transaction.token.symbol
          .toLowerCase()
          .includes(search.trim().toLowerCase())

        return isPartOfSearchFilter && isCompletedTransaction
      })
    },

    sortedTransactions(): UiBridgeTransactionWithToken[] {
      const { filteredTransactions } = this

      return filteredTransactions.sort((a, b) => {
        return b.timestamp - a.timestamp
      })
    },

    totalCount(): number {
      return 10
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken
    }
  },

  mounted() {
    this.fetchWithdrawals()
  },

  methods: {
    fetchWithdrawals(): Promise<void> {
      this.status.setLoading()

      return Promise.all([
        this.$accessor.bridge.fetchPeggyWithdrawalTransactions(),
        this.$accessor.bridge.fetchIBCTransferTransactions(),
        this.$accessor.bridge.fetchInjectiveTransactions()
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.fetchWithdrawals()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.fetchWithdrawals()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchWithdrawals()
    },

    handleClearFilters() {
      this.selectedToken = undefined

      this.fetchWithdrawals()
    }
  }
})
</script>
