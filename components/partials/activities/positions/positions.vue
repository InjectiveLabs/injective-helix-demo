<template>
  <v-card lg>
    <HOCLoading :status="status">
      <v-card-table-wrap>
        <!-- <template #actions>
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
            <side-selector
              class="col-span-2"
              :value="side"
              @click="handleSideClick"
            />
          </div>

          <div class="col-span-12 sm:col-span-6 lg:col-span-8 sm:text-right">
            <v-button
              v-if="orders.length > 0 && isUserWalletConnected"
              red-outline
              md
              @click.stop="handleCancelOrders"
            >
              {{ $t('trade.cancelAllOrders') }}
            </v-button>
          </div>
        </template> -->

        <div class="table-responsive min-h-orders max-h-lg mt-6">
          <table v-if="filteredPositions.length > 0" class="table">
            <position-table-header market-column-enabled />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-position"
                v-for="(position, index) in filteredPositions"
                :key="`positions-${index}-${position.marketId}`"
                :position="position"
              ></tr>
            </tbody>
          </table>

          <div v-else class="min-h-orders w-full bg-gray-900 flex">
            <div class="grow text-center m-auto">
              <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
              <p>{{ $t('trade.emptyPositions') }}</p>
            </div>
          </div>
        </div>
      </v-card-table-wrap>
    </HOCLoading>
  </v-card>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiPosition,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    'v-position': Position,
    PositionTableHeader,
    HOCLoading
  },

  data() {
    return {
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredPositions(): UiPosition[] {
      const { positions } = this

      return positions
      // return orders.filter((o) => {
      //   const market = markets.find((m) => m.marketId === o.marketId)

      //   if (!market || (!search && !side)) {
      //     return true
      //   }

      //   const isPartOfSearchFilter =
      //     !search ||
      //     market.ticker.toLowerCase().includes(search.trim().toLowerCase())
      //   const isPartOfSideFilter = !side || o.orderSide === side

      //   return isPartOfSearchFilter && isPartOfSideFilter
      // })
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
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
    // handleCancelOrders() {
    //   const { orders } = this

    //   this.status.setLoading()

    //   this.$accessor.activities
    //     .batchCancelDerivativeOrders(orders)
    //     .then(() => {
    //       this.$toast.success(this.$t('activities.cancelOrdersSuccess'))
    //     })
    //     .catch(this.$onRejected)
    //     .finally(() => {
    //       this.status.setIdle()
    //     })
    // },

    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    }
  }
})
</script>
