<script lang="ts" setup>
// import { PropType } from 'vue'
// import { Status } from '@injectivelabs/utils'
import { BridgeTransactionState } from '@injectivelabs/sdk-ui-ts'
import { ActivityForm } from '@/types'

// const props = defineProps({
//   status: {
//     type: Object as PropType<Status>,
//     default: () => new Status()
//   }
// })

const bridgeStore = useBridgeStore()

const formValues = useFormValues<ActivityForm>()

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
</script>

<template>
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
</template>
