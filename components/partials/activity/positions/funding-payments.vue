<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <Toolbar>
        <template #filters>
          <SearchAsset
            :markets="markets"
            :value="selectedToken"
            @select="handleSearch"
          />

          <ClearFiltersButton
            v-if="showClearFiltersButton"
            @clear="handleClearFilters"
          />
        </template>

        <template #actions>
          <span class="flex items-center gap-1 text-xs">
            <span>{{ $t('trade.pair') }}</span>
            <span>/</span>
            <span>{{ $t('trade.time') }}</span>
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.timestamp_tooltip')"
            />
          </span>

          <span class="flex items-center justify-end gap-1 text-xs">
            <span>
              {{ $t('fundingPayments.payment') }}
            </span>
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('fundingPayments.paymentTooltip')"
            />
          </span>
        </template>
      </Toolbar>

      <!-- mobile table -->
      <TableBody
        :show-empty="fundingPayments.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobileFundingPayment
          v-for="(fundingPayment, index) in fundingPayments"
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
        <table v-if="fundingPayments.length > 0" class="table">
          <FundingPaymentsTableHeader />
          <tbody>
            <tr
              is="FundingPaymentRow"
              v-for="(fundingPayment, index) in fundingPayments"
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

      <Pagination
        v-if="status.isIdle()"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'
import FundingPaymentsTableHeader from '~/components/partials/common/derivatives/funding-payments-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import FundingPaymentRow from '~/components/partials/common/derivatives/funding-payment.vue'
import MobileFundingPayment from '~/components/partials/common/derivatives/mobile-funding-payment.vue'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import SearchAsset from '@/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '@/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '@/components/partials/activity/common/toolbar.vue'

export default Vue.extend({
  components: {
    FundingPaymentRow,
    FundingPaymentsTableHeader,
    MobileFundingPayment,
    TableBody,
    Pagination,
    SearchAsset,
    ClearFiltersButton,
    Toolbar
  },

  data() {
    return {
      search: '',
      status: new Status(StatusType.Loading),
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    activeMarketIds(): string[] {
      return this.$accessor.derivatives.activeMarketIds
    },

    fundingPayments(): FundingPayment[] {
      return this.$accessor.activity.subaccountFundingPayments
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    totalCount(): number {
      return this.$accessor.activity.subaccountFundingPaymentsPagination.total
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken
    },

    skip(): number {
      const { page, limit } = this

      return (page - 1) * limit
    }
  },

  mounted() {
    this.fetchFundingPayments()
  },

  methods: {
    fetchFundingPayments(): Promise<void> {
      const { skip, limit, activeMarketIds: marketIds } = this

      const marketId = this.markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId
      this.status.setLoading()

      return Promise.all([
        this.$accessor.activity.fetchSubaccountFundingPayments({
          pagination: {
            skip,
            limit
          },
          filters: {
            marketId,
            marketIds
          }
        })
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.fetchFundingPayments()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.fetchFundingPayments()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchFundingPayments()
    },

    handleClearFilters() {
      this.selectedToken = undefined

      this.fetchFundingPayments()
    }
  }
})
</script>
