<script lang="ts" setup>
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

const sortedTrades = computed(() =>
  trades.value.sort((t1, t2) => t2.executedAt - t1.executedAt)
)

function onShowTradeDetails(trade: UiTrade) {
  tradeDetails.value = trade

  modalStore.openModal(Modal.MobileTradeDetails)
}
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :is-empty="sortedTrades.length === 0"
      class="sm:hidden max-h-lg"
    >
      <PartialsCommonSubaccountTradeHistoryMobile
        v-for="(trade, index) in sortedTrades"
        :key="`mobile-trade-history-${index}-${trade.orderHash}`"
        class="col-span-1"
        :trade="trade"
        :is-spot="isSpot"
        @showTradeDetails="onShowTradeDetails"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyTrades')"
          class="min-h-orders bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table v-if="sortedTrades.length > 0" class="table">
        <PartialsCommonSubaccountTradeHistoryHeader :market="market" />
        <tbody>
          <PartialsCommonSubaccountTradeHistoryRow
            v-for="(trade, index) in sortedTrades"
            :key="`trades-history-${index}-${trade.orderHash}`"
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
