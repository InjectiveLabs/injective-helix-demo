<template>
  <div
    v-if="isModalOpen"
    class="fixed inset-0 top-12 lg:top-14 bg-gray-900 w-full"
  >
    <HocLoading :status="status">
      <div class="container py-6 h-full">
        <div
          class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 flex flex-col h-full"
        >
          <div class="flex items-center justify-start gap-2">
            <div class="cursor-pointer" @click="handleClose">
              <IconArrowLeft class="w-4 h-4 text-white" />
            </div>

            <span class="font-bold text-sm">
              {{ $t('account.assetDetails.title') }}
            </span>
          </div>

          <div class="mt-6 border-b border-gray-600">
            <div class="flex items-center justify-start gap-2">
              <img :src="tokenLogo" :alt="balance.token.name" class="w-4 h-4" />
              <span class="tracking-wide font-bold text-sm">
                {{ balance.token.symbol }}
              </span>
              <span class="text-gray-450 text-xs">
                {{ balance.token.name }}
              </span>
            </div>

            <div class="flex flex-col gap-4 py-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.availableBalance') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ availableBalanceToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.inUseReserved') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ inOrderBalanceToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.totalBalance') }}
                </span>

                <span class="font-mono text-sm tracking-wide">
                  {{ combinedBalanceToString }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-350 text-sm">
                  {{ $t('account.balances.cols.value', { symbol: 'USD' }) }}
                </span>
                <span class="font-mono text-sm tracking-wide">
                  {{ combinedBalanceInUsdToString }} USD
                </span>
              </div>
            </div>
          </div>

          <div class="py-6 h-full overflow-hidden flex flex-col gap-4">
            <span class="font-bold text-sm">
              {{ $t('account.assetDetails.trade') }}
            </span>

            <div
              v-if="filteredMarkets.length > 0"
              class="h-full overflow-y-auto"
            >
              <div class="grid grid-cols-2 gap-4">
                <nuxt-link
                  v-for="{ market, summary } in filteredMarketsWithSummary"
                  :key="market.slug"
                  :to="{
                    name: 'spot-spot',
                    params: { marketId: market.marketId, spot: market.slug }
                  }"
                >
                  <MarketCard :market="market" :summary="summary" />
                </nuxt-link>
              </div>
            </div>

            <div v-else class="mt-4">
              <span class="text-sm">
                {{ $t('account.assetDetails.emptyMarkets') }}
              </span>
            </div>
          </div>

          <div class="mt-auto flex justify-between gap-4">
            <button
              class="w-full cursor-pointer h-10 flex justify-center items-center rounded-lg bg-blue-300 border-transparent border"
              @click="handleDepositClick"
            >
              <span class="text-sm font-medium">
                {{ $t('account.deposit') }}
              </span>
            </button>

            <button
              class="w-full cursor-pointer h-10 flex justify-center items-center rounded-lg bg-transparent border-blue-300 border"
              @click="handleWithdrawClick"
            >
              <span class="text-sm font-medium text-blue-300">
                {{ $t('account.withdraw') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import {
  getTokenLogoWithVendorPathPrefix,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import MarketCard from './market-card.vue'
import { AccountBalance, Modal, UiMarketAndSummary } from '~/types'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: { MarketCard },

  data() {
    return {
      status: new Status(StatusType.Idle),
      scrollOffset: 0
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.AssetDetails]
    },

    balance(): AccountBalance {
      return this.$accessor.modal.data
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    marketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    filteredMarkets(): UiSpotMarketWithToken[] {
      const { markets, balance } = this

      return markets.filter(
        (m) =>
          m.baseDenom === balance.token.denom ||
          m.quoteDenom === balance.token.denom
      )
    },

    filteredMarketsWithSummary(): UiMarketAndSummary[] {
      const { filteredMarkets, marketsSummary } = this

      return filteredMarkets.map((market: UiSpotMarketWithToken) => {
        const summary = marketsSummary.find(
          (s: UiSpotMarketSummary) => s.marketId === market.marketId
        )

        return {
          market,
          summary
        } as UiMarketAndSummary
      })
    },

    availableBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.subaccountAvailableBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.subaccountAvailableBalance).toBase(
        balance.token.decimals
      )
    },

    availableBalanceToString(): string {
      const { availableBalance } = this

      return availableBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    inOrderBalanceToString(): string {
      const { balance } = this

      return balance.inOrderBalance.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    combinedBalance(): BigNumberInBase {
      const { balance } = this

      return balance.bankBalance.plus(balance.subaccountAvailableBalance)
    },

    combinedBalanceToString(): string {
      const { combinedBalance } = this

      return combinedBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    combinedBalanceInUsdToString(): string {
      const { combinedBalance, balance } = this

      return combinedBalance
        .times(balance.token.usdPrice)
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS, BigNumberInBase.ROUND_DOWN)
    },

    tokenLogo(): string {
      const { balance } = this

      return getTokenLogoWithVendorPathPrefix(balance.token.logo)
    }
  },

  watch: {
    isModalOpen: {
      handler(value: boolean) {
        if (value) {
          this.handleOpen()
          return
        }

        this.handleClosed()
      },
      immediate: true
    }
  },

  methods: {
    handleOpen() {
      document.body.classList.add('overflow-hidden')
      this.scrollOffset = window.pageYOffset
      window.scrollTo(0, 0)
    },

    handleClosed() {
      document.body.classList.remove('overflow-hidden')
      window.scrollTo(0, this.scrollOffset)
    },

    handleClose() {
      this.$accessor.modal.closeModal(Modal.AssetDetails)
    },

    handleDepositClick() {
      const { balance } = this

      this.$root.$emit('bridge:deposit', balance.token)
    },

    handleWithdrawClick() {
      const { balance } = this

      this.$root.$emit('bridge:withdraw', balance.token)
    }
  }
})
</script>
