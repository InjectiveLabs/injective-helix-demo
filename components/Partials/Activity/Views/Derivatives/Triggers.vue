<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const derivativeStore = useDerivativeStore()

const triggers = computed(() => {
  return derivativeStore.subaccountConditionalOrders
})
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full-flex">
      <!-- mobile table -->
      <CommonTableBody
        :show-empty="triggers.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsTradingTableTriggerMobile
          v-for="(trigger, index) in triggers"
          :key="`mobile-derivative-triggers-${index}-${trigger.orderHash}`"
          class="col-span-1"
          :order="trigger"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyTriggers')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper break-md class="hidden sm:block">
        <table v-if="triggers.length > 0" class="table">
          <PartialsTradingTableTriggerHeader />
          <tbody>
            <PartialsTradingTableTriggerRow
              v-for="(trigger, index) in triggers"
              :key="`trigger-${index}`"
              :trigger="trigger"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('trade.emptyTriggers')"
          data-cy="universal-table-nothing-found"
          class="pb-4 grow"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>
