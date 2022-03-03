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
        <table v-if="filteredFundingPayments.length > 0" class="table">
          <funding-payments-table-header />
          <tbody>
            <tr
              is="v-funding-payment"
              v-for="(fundingPayment, index) in filteredFundingPayments"
              :key="`funding-payments-${index}-${fundingPayment.marketId}`"
              :funding-payment="fundingPayment"
            />
          </tbody>
        </table>
        <v-empty-list
          v-else
          :message="$t('fundingPayments.emptyFundingPayments')"
        />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import { FundingPayment } from '@injectivelabs/derivatives-consumer'
import FundingPaymentsTableHeader from '~/components/partials/common/derivatives/funding-payments-table-header.vue'
import VFundingPayment from '~/components/partials/common/derivatives/funding-payment.vue'

export default Vue.extend({
  components: {
    'v-funding-payment': VFundingPayment,
    FundingPaymentsTableHeader
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    fundingPayments(): FundingPayment[] {
      return this.$accessor.activity.subaccountFundingPayments
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredFundingPayments(): FundingPayment[] {
      const { fundingPayments, markets, search } = this

      return fundingPayments.filter((p) => {
        const market = markets.find((m) => m.marketId === p.marketId)

        if (!market || !search) {
          return true
        }

        const isPartOfSearchFilter = market.ticker
          .toLowerCase()
          .includes(search.trim().toLowerCase())

        return isPartOfSearchFilter
      })
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.activity.fetchSubaccountFundingPayments()])
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
