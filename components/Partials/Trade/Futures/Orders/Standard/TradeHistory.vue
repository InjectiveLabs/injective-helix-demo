<script setup lang="ts">
import { Modal } from '@/types'
import type { SharedUiDerivativeTrade } from '@shared/types'

const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()

const selectedTrade = ref<undefined | SharedUiDerivativeTrade>(undefined)

function resetSelectedTrade() {
  selectedTrade.value = undefined
}

function onShareTrade(trade: SharedUiDerivativeTrade) {
  selectedTrade.value = trade
  modalStore.openModal(Modal.ShareTradePnl)
}
</script>

<template>
  <PartialsPortfolioOrdersFuturesTradeHistoryTable
    :trades="derivativeStore.subaccountTrades"
    @trade:share="onShareTrade"
  />

  <ModalsSharePnlDerivativeTrade
    v-if="selectedTrade"
    v-bind="{ trade: selectedTrade }"
    @on:close="resetSelectedTrade"
  />
</template>
