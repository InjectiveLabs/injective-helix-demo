<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div class="col-span-12 lg:col-span-8 grid grid-cols-5 sm:grid-cols-4 gap-4 w-full">
            <TokenSelector
              class="token-selector__token-only"
              :value="selectedToken"
              :options="supportedTokens"
              :placeholder="'Search asset'"
              :balance="balance"
              dense
              rounded
              show-default-indicator
              @input:token="handleSelectToken"
            />

            <div
              v-if="showClearAllButton"
              class="flex items-center h-[40px] text-sm cursor-pointer text-primary-500 hover:text-primary-600"
              @click="handleClearFilters"
            >
              {{ $t('filters.clearAll') }}
            </div>
          </div>
        </template>

        <TableWrapper break-md class="mt-4">
          <table v-if="filteredTransactions.length > 0" class="table">
            <TransfersTableHeader />
            <tbody>
              <tr
                is="Transfer"
                v-for="(transaction, index) in filteredTransactions"
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
      </VCardTableWrap>

      <Pagination
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
      />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { BankBalanceWithTokenAndBalanceInBase, UiBridgeTransactionWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import TransfersTableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'
import Transfer from '~/components/partials/activity/wallet-history/transfers/transfer.vue'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import TokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

export default Vue.extend({
  components: {
    Transfer,
    TransfersTableHeader,
    Pagination,
    TokenSelector
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

    filteredTransactions(): UiBridgeTransactionWithToken[] {
      const {
        transactions
        // search
      } = this
      return transactions
      // return transactions.filter((transaction) => {
      //   if (!search) {
      //     return true
      //   }
      //   const isPartOfSearchFilter = transaction.token.symbol
      //     .toLowerCase()
      //     .includes(search.trim().toLowerCase())
      //   return isPartOfSearchFilter
      // })
    },

    totalCount(): number {
      return this.$accessor.bridge.subaccountTransferBridgeTransactionsTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      return this.$store.state.activity.supportedTokens
    },

    showClearAllButton(): boolean {
      return !!this.selectedToken
    }
  },

  mounted() {
    this.updateTransfers()
  },

  methods: {
    updateTransfers() {
      this.status.setLoading()

      const denom = this.selectedToken?.denom

      Promise.all([
        this.$accessor.bridge.fetchSubaccountTransfers(
          {
            pagination: {
              skip: (this.page - 1) * this.limit,
              limit: this.limit
            },
            filters: {
              denom
            }
          }
        )
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    // handleInputOnSearch(search: string) {
    //   this.search = search
    // },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.updateTransfers()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.updateTransfers()
    },

    handleSelectToken(token: Token) {
      this.selectedToken = token

      this.updateTransfers()
    },

    handleClearFilters() {
      this.selectedToken = undefined

      this.updateTransfers()
    }
  }
})
</script>
