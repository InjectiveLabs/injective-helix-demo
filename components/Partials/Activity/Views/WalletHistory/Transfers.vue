<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const bridgeStore = useBridgeStore()

const transactions = computed(
  () => bridgeStore.subaccountTransferBridgeTransactions
)
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full">
      <CommonTableWrapper is-break-md>
        <table v-if="transactions.length > 0" class="table">
          <PartialsActivityViewsWalletHistoryCommonTableHeader />
          <tbody>
            <PartialsActivityViewsWalletHistoryTransfer
              v-for="(transaction, index) in transactions"
              :key="`transfers-${index}`"
              :transaction="transaction"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('walletHistory.emptySubaccountTransfers')"
          class="pb-4 grow bg-gray-900"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>
