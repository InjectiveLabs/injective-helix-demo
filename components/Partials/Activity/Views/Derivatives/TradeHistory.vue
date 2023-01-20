<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { UiSpotTrade, UiDerivativeTrade } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const modalStore = useModalStore()
const derivativeStore = useDerivativeStore()

const tradeDetails = ref(undefined as UiDerivativeTrade | undefined)

const trades = computed(() => {
  return derivativeStore.subaccountTrades
})

function handleShowTradeDetails(value: UiSpotTrade | UiDerivativeTrade) {
  tradeDetails.value = value as UiDerivativeTrade

  modalStore.openModal({ type: Modal.MobileTradeDetails })
}
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full-flex">
      <!-- mobile table -->
      <CommonTableBody
        :show-empty="trades.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsTradingTableTradeHistoryMobile
          v-for="(trade, index) in trades"
          :key="`mobile-derivative-trade-${index}`"
          class="col-span-1"
          :trade="trade"
          @show-trade-details="handleShowTradeDetails"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyTrades')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper break-md class="hidden sm:block">
        <table v-if="trades.length > 0" class="table">
          <PartialsTradingTableTradeHistoryHeader />
          <tbody>
            <PartialsTradingTableTradeHistoryRow
              v-for="(trade, index) in trades"
              :key="`trade-${index}`"
              :trade="trade"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('trade.emptyTrades')"
          data-cy="universal-table-nothing-found"
          class="pb-4 grow"
        />
      </CommonTableWrapper>

      <ModalsMobileTradeDetails :trade="tradeDetails" />
    </div>
  </AppHocLoading>
</template>
