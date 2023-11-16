<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

const swapStore = useSwapStore()

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
      <!-- mobile table -->
      <CommonTableBody
        :is-empty="swapStore.swapHistory.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountSwapHistoryMobile
          v-for="(swap, index) in swapStore.swapHistory"
          :key="`swap-mobile-${index}-${swap.txHash}`"
          v-bind="{ swap }"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyTrades')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper is-break-md class="hidden sm:block">
        <table v-if="swapStore.swapHistory.length > 0" class="table">
          <PartialsCommonSubaccountSwapHistoryHeader />
          <tbody>
            <PartialsCommonSubaccountSwapHistoryRow
              v-for="(swap, index) in swapStore.swapHistory"
              :key="`swap-${index}-${swap.txHash}`"
              v-bind="{ swap }"
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
    </div>
  </AppHocLoading>
</template>
