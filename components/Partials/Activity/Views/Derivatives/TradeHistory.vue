<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'
import { SharedUiDerivativeTrade } from '@shared/types'
import { Modal, UiTrade } from '@/types'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const modalStore = useModalStore()
const derivativeStore = useDerivativeStore()

const tradeDetails = ref(undefined as SharedUiDerivativeTrade | undefined)

const trades = computed(() => derivativeStore.subaccountTrades)

function onShowTradeDetails(value: UiTrade) {
  tradeDetails.value = value as SharedUiDerivativeTrade

  modalStore.openModal(Modal.MobileTradeDetails)
}
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full">
      <!-- mobile table -->
      <CommonTableBody
        :is-empty="trades.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountTradeHistoryMobile
          v-for="(trade, index) in trades"
          :key="`mobile-derivative-trade-${index}`"
          class="col-span-1"
          :trade="trade"
          @show-trade-details="onShowTradeDetails"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyTrades')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper is-break-md class="hidden sm:block">
        <table v-if="trades.length > 0" class="table">
          <PartialsCommonSubaccountTradeHistoryHeader />
          <tbody>
            <PartialsCommonSubaccountTradeHistoryRow
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
