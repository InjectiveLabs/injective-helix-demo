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
        <table v-if="transactions.length > 0" class="table">
          <TransfersTableHeader />
          <tbody>
            <tr
              is="Transfer"
              v-for="(transaction, index) in transactions"
              :key="`transfers-${index}-${transaction.timestamp}`"
              :transaction="transaction"
            />
          </tbody>
        </table>
        <EmptyList
          v-else
          :message="$t('walletHistory.emptySubaccountTransfers')"
          class="min-h-orders"
        />
      </TableWrapper>

      <Pagination
        v-if="status.isIdle() && transactions.length > 0"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiBridgeTransactionWithToken } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import TransfersTableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'
import Transfer from '~/components/partials/activity/wallet-history/transfers/transfer.vue'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import SearchAsset from '@/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '@/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '@/components/partials/activity/common/toolbar.vue'

export default Vue.extend({
  components: {
    Transfer,
    TransfersTableHeader,
    Pagination,
    SearchAsset,
    ClearFiltersButton,
    Toolbar
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
      return this.$accessor.bridge.subaccountTransferBridgeTransactions
    },

    totalCount(): number {
      return this.$accessor.bridge
        .subaccountTransferBridgeTransactionsPagination.total
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken
    },

    skip(): number {
      const { page, limit } = this

      return (page - 1) * limit
    }
  },

  mounted() {
    this.fetchTransfers()
  },

  methods: {
    fetchTransfers(): Promise<void> {
      const { skip, limit } = this

      const denom = this.selectedToken?.denom

      this.status.setLoading()

      return Promise.all([
        this.$accessor.bridge.fetchSubaccountTransfers({
          pagination: {
            skip,
            limit
          },
          filters: {
            denom
          }
        })
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.fetchTransfers()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.fetchTransfers()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchTransfers()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.page = 1

      this.fetchTransfers()
    }
  }
})
</script>
