<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { Modal, UiMarketWithToken, UiTrade } from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot
const tradeDetails = ref(undefined as UiTrade | undefined)

const trades = computed(() =>
  isSpot ? spotStore.subaccountTrades : derivativeStore.subaccountTrades
)

function handleShowTradeDetails(trade: UiTrade) {
  tradeDetails.value = trade
  modalStore.openModal({ type: Modal.MobileTradeDetails })
}
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :show-empty="trades.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <PartialsTradingTableTradeHistoryMobile
        v-for="(trade, index) in trades"
        :key="`mobile-trade-history-${index}`"
        class="col-span-1"
        :trade="trade"
        :is-spot="isSpot"
        @showTradeDetails="handleShowTradeDetails"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyTrades')"
          class="min-h-orders bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table v-if="trades.length > 0" class="table">
        <PartialsTradingTableTradeHistoryHeader :market="market" />
        <tbody>
          <PartialsTradingTableTradeHistoryRow
            v-for="(trade, index) in trades"
            :key="`trades-history-${index}`"
            :trade="trade"
            :is-spot="isSpot"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyTrades')" />
    </CommonTableWrapper>

    <ModalsMobileTradeDetails :trade="tradeDetails" :is-spot="isSpot" />
  </div>
</template>
