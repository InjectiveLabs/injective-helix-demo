<template>
  <VHocLoading :status="status">
    <v-card-table-wrap>
      <template #actions>
        <div
          class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
        >
          <v-search
            dense
            class="col-span-3"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />
        </div>
      </template>

      <v-table-wrapper break-md class="mt-4">
        <table v-if="filteredTransactions.length > 0" class="table">
          <table-header />
          <tbody>
            <tr
              is="v-deposit"
              v-for="(transaction, index) in sortedTransactions"
              :key="`deposit-${index}-${transaction.timestamp}`"
              :transaction="transaction"
            />
          </tbody>
        </table>
        <v-empty-list
          v-else
          :message="$t('walletHistory.emptyDepositTransactions')"
          class="mt-6 min-h-orders"
        />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  BridgeTransactionState,
  UiBridgeTransactionWithToken
} from '@injectivelabs/ui-common'
import VDeposit from './deposit.vue'
import TableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'

export default Vue.extend({
  components: {
    TableHeader,
    VDeposit
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    transactions(): UiBridgeTransactionWithToken[] {
      return this.$accessor.bridge.depositTransactions
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
      this.$accessor.bridge.fetchPeggyDepositTransactions(),
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
