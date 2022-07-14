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
    </VCardTableWrap>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  BridgeTransactionState,
  UiBridgeTransactionWithToken
} from '@injectivelabs/sdk-ui-ts'
import VWithdrawal from './withdrawal.vue'
import TableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'

export default Vue.extend({
  components: {
    TableHeader,
    VWithdrawal
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading)
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
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([
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

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    }
  }
})
</script>
