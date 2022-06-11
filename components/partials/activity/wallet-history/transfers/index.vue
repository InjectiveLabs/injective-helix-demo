<template>
  <HocLoading :status="status">
    <VCardTableWrap>
      <template #actions>
        <div
          class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
        >
          <VSearch
            dense
            class="col-span-3"
            data-cy="universal-table-filter-by-asset-input"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />
        </div>
      </template>

      <TableWrapper break-md class="mt-4">
        <table v-if="sortedTransactions.length > 0" class="table">
          <TransfersTableHeader />
          <tbody>
            <tr
              is="Transfer"
              v-for="(transaction, index) in sortedTransactions"
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
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiBridgeTransactionWithToken } from '@injectivelabs/sdk-ui-ts'
import TransfersTableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'
import Transfer from '~/components/partials/activity/wallet-history/transfers/transfer.vue'

export default Vue.extend({
  components: {
    Transfer,
    TransfersTableHeader
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    transactions(): UiBridgeTransactionWithToken[] {
      return this.$accessor.bridge.subaccountTransferBridgeTransactions
    },

    filteredTransactions(): UiBridgeTransactionWithToken[] {
      const { transactions, search } = this

      return transactions.filter((transaction) => {
        if (!search) {
          return true
        }

        const isPartOfSearchFilter = transaction.token.symbol
          .toLowerCase()
          .includes(search.trim().toLowerCase())

        return isPartOfSearchFilter
      })
    },

    sortedTransactions(): UiBridgeTransactionWithToken[] {
      const { filteredTransactions } = this

      return filteredTransactions.sort((a, b) => {
        return b.timestamp - a.timestamp
      })
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.bridge.fetchSubaccountTransfers()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    }
  }
})
</script>
