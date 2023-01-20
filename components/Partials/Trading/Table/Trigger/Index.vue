<script lang="ts" setup>
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :show-empty="derivativeStore.subaccountConditionalOrders.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <PartialsTradingTableTriggerMobile
        v-for="(trigger, index) in derivativeStore.subaccountConditionalOrders"
        :key="`mobile-derivative-triggers-${index}-${trigger.orderHash}`"
        class="col-span-1"
        :order="trigger"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyTriggers')"
          class="pb-4 bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table
        v-if="derivativeStore.subaccountConditionalOrders.length > 0"
        class="table"
      >
        <PartialsTradingTableTriggerHeader />
        <tbody>
          <PartialsTradingTableTriggerRow
            v-for="(
              trigger, index
            ) in derivativeStore.subaccountConditionalOrders"
            :key="`triggers-${index}`"
            :trigger="trigger"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyTriggers')" />
    </CommonTableWrapper>
  </div>
</template>
