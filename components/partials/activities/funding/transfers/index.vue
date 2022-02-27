<template>
  <v-card lg>
    <VHocLoading :status="status">
      <v-card-table-wrap>
        <template #actions>
          <div
            class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
          >
            <filter-selector
              class="self-start min-w-4xs"
              :type="TradeSelectorType.Side"
              :value="side"
              @click="handleSideClick"
            />
          </div>
        </template>

        <div
          v-if="filteredTransfers.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <transfers-table-header />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-transfer"
                v-for="(transfer, index) in filteredTransfers"
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
import { UiSubaccountTransfer } from '@injectivelabs/ui-common'
import TransfersTableHeader from '~/components/partials/activities/funding/transfers/table-header.vue'
import VTransfer from '~/components/partials/activities/funding/transfers/transfer.vue'
import { TradeSelectorType } from '~/types/enums'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'

export default Vue.extend({
  components: {
    'v-transfer': VTransfer,
    TransfersTableHeader,
    FilterSelector
  },

  data() {
    return {
      TradeSelectorType,
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    transfers(): UiSubaccountTransfer[] {
      return this.$accessor.activities.subaccountTransfers
    },

    filteredTransfers(): UiSubaccountTransfer[] {
      const { transfers, side } = this

      return transfers.filter((transfer) => {
        if (!side) {
          return true
        }

        const isPartOfSideFilter = !side || transfer.transferType === side

        return isPartOfSideFilter
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
    handleSideClick(side: string | undefined) {
      this.side = side
    }
  }
})
</script>
