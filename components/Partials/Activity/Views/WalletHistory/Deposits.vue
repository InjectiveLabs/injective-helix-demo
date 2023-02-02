<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { BridgeTransactionState } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  },

  denom: {
    type: String,
    default: ''
  }
})

const bridgeStore = useBridgeStore()

const filteredTransactions = computed(() => {
  return bridgeStore.depositTransactions.filter((transaction) => {
    const isCompletedTransaction =
      transaction.state === BridgeTransactionState.Completed

    const isPartOfSearchFilter =
      !props.denom ||
      transaction.denom.toLowerCase() === props.denom.toLowerCase()

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
            <PartialsActivityViewsWalletHistoryDeposit
              v-for="(transaction, index) in sortedTransactions"
              :key="`deposit-${index}-${transaction.timestamp}`"
              :transaction="transaction"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('walletHistory.emptyDepositTransactions')"
          class="pb-4 grow bg-gray-900"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>
