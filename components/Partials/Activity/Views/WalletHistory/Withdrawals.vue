<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { BridgeTransactionState } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  },

  symbol: {
    type: String,
    required: true
  }
})

const bridgeStore = useBridgeStore()

const transactions = computed(() => {
  return bridgeStore.subaccountTransferBridgeTransactions
})

const filteredTransactions = computed(() => {
  return transactions.value.filter((transaction) => {
    const isCompletedTransaction =
      transaction.state === BridgeTransactionState.Completed

    if (!props.symbol && isCompletedTransaction) {
      return true
    }

    const isPartOfSearchFilter = transaction.token.symbol
      .toLowerCase()
      .includes(props.symbol.trim().toLowerCase())

    return isPartOfSearchFilter && isCompletedTransaction
  })
})

const sortedTransactions = computed(() => {
  return filteredTransactions.value.sort((a, b) => {
    return b.timestamp - a.timestamp
  })
})
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full-flex">
      <CommonTableWrapper break-md>
        <table v-if="filteredTransactions.length > 0" class="table">
          <PartialsActivityViewsWalletHistoryCommonTableHeader />
          <tbody>
            <PartialsActivityViewsWalletHistoryWithdrawal
              v-for="(transaction, index) in sortedTransactions"
              :key="`withdrawal-${index}-${transaction.timestamp}`"
              :transaction="transaction"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('walletHistory.emptyWithdrawalTransactions')"
          class="pb-4 grow bg-gray-900"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>
