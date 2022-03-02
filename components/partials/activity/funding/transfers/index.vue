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
        <table v-if="sortedTransfers.length > 0" class="table">
          <transfers-table-header />
          <tbody>
            <tr
              is="v-transfer"
              v-for="(transfer, index) in sortedTransfers"
              :key="`transfers-${index}-${transfer.executedAt}`"
              :transfer="transfer"
            />
          </tbody>
        </table>
        <v-empty-list
          v-else
          :message="$t('fundingHistory.emptySubaccountTransfers')"
        />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSubaccountTransferWithToken } from '@injectivelabs/ui-common'
import TransfersTableHeader from '~/components/partials/activity/funding/common/table-header.vue'
import VTransfer from '~/components/partials/activity/funding/transfers/transfer.vue'

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
    transfers(): UiSubaccountTransferWithToken[] {
      return this.$accessor.activity.subaccountTransfers
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

    Promise.all([this.$accessor.activity.fetchSubaccountTransfers()])
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
