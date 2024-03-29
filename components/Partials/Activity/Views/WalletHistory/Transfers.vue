<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

const activityStore = useActivityStore()

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full">
      <CommonTableWrapper is-break-md>
        <table
          v-if="activityStore.subaccountTransfers.length > 0"
          class="table"
        >
          <PartialsActivityViewsWalletHistoryCommonTableHeader />
          <tbody>
            <PartialsActivityViewsWalletHistoryTransfer
              v-for="(transaction, index) in activityStore.subaccountTransfers"
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
