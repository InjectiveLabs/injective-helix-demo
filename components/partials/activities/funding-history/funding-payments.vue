<template>
  <v-card lg>
    <HOCLoading :status="status">
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
          v-if="filteredFundingPayments.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <thead></thead>
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-funding-payment"
                v-for="(fundingPayment, index) in filteredFundingPayments"
                :key="`funding-payment-${index}-${fundingPayment.marketId}`"
                :funding-payment="fundingPayment"
              ></tr>
            </tbody>
          </table>
        </div>
        <v-empty-list
          v-else
          :message="$t('fundingPayments.emptyFundingPayments')"
          class="mt-6"
        />
      </v-card-table-wrap>
    </HOCLoading>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import { FundingPayment } from '@injectivelabs/derivatives-consumer'
import VFundingPayment from './funding-payment.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    VFundingPayment,
    HOCLoading
  },

  data() {
    return {
      TradeSelectorType,

      search: '',
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    fundingPayments(): FundingPayment[] {
      return this.$accessor.activities.subaccountFundingPayments
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredFundingPayments(): FundingPayment[] {
      const { markets, search, fundingPayments } = this

      return fundingPayments.filter((fundingPayment) => {
        const market = markets.find(
          (m) => m.marketId === fundingPayment.marketId
        )

        if (!market || !search) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())

        return isPartOfSearchFilter
      })
    }
  },

  mounted() {
    Promise.all([this.$accessor.activities.fetchSubaccountFundingPayments()])
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
