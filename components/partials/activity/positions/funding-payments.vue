<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div
            class="col-span-12 lg:col-span-8 grid grid-cols-5 sm:grid-cols-4 gap-4 w-full"
          >
            <TokenSelector
              class="token-selector__token-only"
              :value="selectedToken"
              :options="supportedTokens"
              :placeholder="'Search asset'"
              :balance="balance"
              dense
              rounded
              show-default-indicator
              @input:token="handleSelectToken"
            />

            <div
              v-if="showClearAllButton"
              class="flex items-center h-[40px] text-sm cursor-pointer text-primary-500 hover:text-primary-600"
              @click="handleClearFilters"
            >
              {{ $t('filters.clearAll') }}
            </div>
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
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  BankBalanceWithTokenAndBalance,
  BankBalanceWithTokenAndBalanceInBase,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'
import FundingPaymentsTableHeader from '~/components/partials/common/derivatives/funding-payments-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import FundingPaymentRow from '~/components/partials/common/derivatives/funding-payment.vue'
import MobileFundingPayment from '~/components/partials/common/derivatives/mobile-funding-payment.vue'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import TokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

export default Vue.extend({
  components: {
    FundingPaymentRow,
    FundingPaymentsTableHeader,
    MobileFundingPayment,
    TableBody,
    Pagination,
    TokenSelector
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
    fundingPayments(): FundingPayment[] {
      return this.$accessor.activity.subaccountFundingPayments
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredFundingPayments(): FundingPayment[] {
      const {
        fundingPayments
        // markets,
        // search
      } = this
      return fundingPayments
      // return fundingPayments.filter((p) => {
      //   const market = markets.find((m) => m.marketId === p.marketId)
      //   if (!market || !search) {
      //     return true
      //   }
      //   const isPartOfSearchFilter = market.ticker
      //     .toLowerCase()
      //     .includes(search.trim().toLowerCase())
      //   return isPartOfSearchFilter
      // })
    },

    totalCount(): number {
      return this.$accessor.activity.subaccountFundingPaymentsTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      const supportedTokens = this.$store.state.activity.supportedTokens

      return supportedTokens.filter(
        (token: BankBalanceWithTokenAndBalance) =>
          !!this.markets.find(
            (market) =>
              market.baseToken.denom === token.denom ||
              market.quoteToken.denom === token.denom
          )
      )
    },

    showClearAllButton(): boolean {
      return !!this.selectedToken
    }
  },

  mounted() {
    this.updateFundingPayments()
  },

  methods: {
    updateFundingPayments() {
      this.status.setLoading()

      const marketId = this.markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId

      const marketIds = this.markets.map((market) => market.marketId)

      Promise.all([
        this.$accessor.activity.fetchSubaccountFundingPayments({
          pagination: {
            skip: (this.page - 1) * this.limit,
            limit: this.limit
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

    // handleInputOnSearch(search: string) {
    //   this.search = search
    // },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.updateFundingPayments()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.updateFundingPayments()
    },

    handleSelectToken(token: Token) {
      this.selectedToken = token

      this.updateFundingPayments()
    },

    handleClearFilters() {
      this.selectedToken = undefined

      this.updateFundingPayments()
    }
  }
})
</script>
