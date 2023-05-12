<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { BridgeTransactionState } from '@injectivelabs/sdk-ui-ts'
import { ActivityForm } from '@/types'

const route = useRoute()
const bridgeStore = useBridgeStore()
const formValues = useFormValues<ActivityForm>()

const status = reactive(new Status(StatusType.Loading))

const filteredTransactions = computed(() => {
  return bridgeStore.depositTransactions.filter((transaction) => {
    const isCompletedTransaction =
      transaction.state === BridgeTransactionState.Completed

    const isPartOfSearchFilter =
      !formValues.value.Denom ||
      transaction.token.symbol.toLowerCase() ===
        formValues.value.Denom.toLowerCase()

    return isPartOfSearchFilter && isCompletedTransaction
  })
})

const sortedTransactions = computed(() =>
  filteredTransactions.value.sort((a, b) => b.timestamp - a.timestamp)
)

function fetchData() {
  status.setLoading()

  Promise.all([
    bridgeStore.fetchPeggyDepositTransactions(),
    bridgeStore.fetchIBCTransferTransactions(),
    bridgeStore.fetchInjectiveTransactions()
  ]).finally(() => {
    status.setIdle()
  })
}

watch(() => route.query, fetchData, { immediate: true })
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div class="w-full h-full">
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
