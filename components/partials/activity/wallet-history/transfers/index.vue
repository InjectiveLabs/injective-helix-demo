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
        <table v-if="sortedTransactions.length > 0" class="table">
          <transfers-table-header />
          <tbody>
            <tr
              is="v-transfer"
              v-for="(transaction, index) in sortedTransactions"
              :key="`transfers-${index}-${transaction.executedAt}`"
              :transaction="transaction"
            />
          </tbody>
        </table>
        <v-empty-list
          v-else
          :message="$t('walletHistory.emptySubaccountTransfers')"
          class="mt-6 min-h-orders"
        />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiBridgeTransactionWithToken } from '@injectivelabs/ui-common'
import TransfersTableHeader from '~/components/partials/activity/wallet-history/common/table-header.vue'
import VTransfer from '~/components/partials/activity/wallet-history/transfers/transfer.vue'

export default Vue.extend({
  components: {
    'v-transfer': VTransfer,
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
