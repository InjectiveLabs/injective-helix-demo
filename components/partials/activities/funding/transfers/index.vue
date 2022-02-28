<template>
  <v-card md>
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

        <div
          v-if="sortedTransfers.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <transfers-table-header />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-transfer"
                v-for="(transfer, index) in sortedTransfers"
                :key="`transfers-${index}-${transfer.executedAt}`"
                :transfer="transfer"
              ></tr>
            </tbody>
          </table>
        </div>
        <v-empty-list
          v-else
          :message="$t('fundingHistory.emptySubaccountTransfers')"
          class="mt-6 min-h-orders"
        />
      </v-card-table-wrap>
    </VHocLoading>
  </v-card>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSubaccountTransferWithToken } from '@injectivelabs/ui-common'
import TransfersTableHeader from '~/components/partials/activities/funding/common/table-header.vue'
import VTransfer from '~/components/partials/activities/funding/transfers/transfer.vue'

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
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    transfers(): UiSubaccountTransferWithToken[] {
      return this.$accessor.activities.subaccountTransfers
    },

    filteredTransfers(): UiSubaccountTransferWithToken[] {
      const { transfers, search } = this

      return transfers.filter((transfer) => {
        if (!search) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          transfer.token.symbol
            .toLowerCase()
            .includes(search.trim().toLowerCase())

        return isPartOfSearchFilter
      })
    },

    sortedTransfers(): UiSubaccountTransferWithToken[] {
      const { filteredTransfers } = this

      return filteredTransfers.sort((a, b) => {
        return b.executedAt - a.executedAt
      })
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.activities.fetchSubaccountTransfers()])
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
