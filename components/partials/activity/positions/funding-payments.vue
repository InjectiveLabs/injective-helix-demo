<template>
  <HocLoading :status="status">
    <VCardTableWrap>
      <template #actions>
        <div
          class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
        >
          <VSearch
            dense
            class="col-span-5 sm:col-span-3"
            :placeholder="$t('trade.search_market')"
            :search="search"
            data-cy="universal-table-filter-by-asset-input"
            @searched="handleInputOnSearch"
          />
        </div>

        <div
          class="col-span-12 grid grid-cols-2 gap-4 sm:hidden mt-4 uppercase text-xs tracking-wide px-2"
        >
          <span class="flex items-center gap-1">
            <span>{{ $t('trade.pair') }}</span>
            <span>/</span>
            <span>{{ $t('trade.time') }}</span>
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.timestamp_tooltip')"
            />
          </span>

          <span class="flex items-center justify-end gap-1">
            <span>
              {{ $t('fundingPayments.payment') }}
            </span>
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('fundingPayments.paymentTooltip')"
            />
          </span>
        </div>
      </template>

      <!-- mobile table -->
      <TableBody
        :show-empty="filteredFundingPayments.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobileFundingPayment
          v-for="(fundingPayment, index) in filteredFundingPayments"
          :key="`mobile-funding-payment-${index}`"
          class="col-span-1"
          :funding-payment="fundingPayment"
        />

        <EmptyList
          slot="empty"
          :message="$t('fundingPayments.emptyFundingPayments')"
        />
      </TableBody>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="filteredFundingPayments.length > 0" class="table">
          <FundingPaymentsTableHeader />
          <tbody>
            <tr
              is="FundingPaymentRow"
              v-for="(fundingPayment, index) in filteredFundingPayments"
              :key="`funding-payments-${index}-${fundingPayment.marketId}`"
              :funding-payment="fundingPayment"
            />
          </tbody>
        </table>
        <EmptyList
          v-else
          data-cy="universal-table-nothing-found"
          :message="$t('fundingPayments.emptyFundingPayments')"
        />
      </TableWrapper>
    </VCardTableWrap>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import FundingPaymentsTableHeader from '~/components/partials/common/derivatives/funding-payments-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import FundingPaymentRow from '~/components/partials/common/derivatives/funding-payment.vue'
import MobileFundingPayment from '~/components/partials/common/derivatives/mobile-funding-payment.vue'

export default Vue.extend({
  components: {
    FundingPaymentRow,
    FundingPaymentsTableHeader,
    MobileFundingPayment,
    TableBody
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
