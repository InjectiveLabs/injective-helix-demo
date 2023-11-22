<script lang="ts" setup>
const derivativeStore = useDerivativeStore()

const sortedTriggers = computed(() =>
  derivativeStore.subaccountConditionalOrders.sort(
    (t1, t2) => t2.updatedAt - t1.updatedAt
  )
)
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :is-empty="sortedTriggers.length === 0"
      class="sm:hidden max-h-lg"
    >
      <PartialsCommonSubaccountTriggerMobile
        v-for="(trigger, index) in sortedTriggers"
        :key="`mobile-derivative-triggers-${index}-${trigger.orderHash}`"
        class="col-span-1"
        :trigger="trigger"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyTriggers')"
          class="pb-4 bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table v-if="sortedTriggers.length > 0" class="table">
        <PartialsCommonSubaccountTriggerHeader />
        <tbody>
          <PartialsCommonSubaccountTriggerRow
            v-for="(trigger, index) in sortedTriggers"
            :key="`triggers-${index}-${trigger.orderHash}`"
            :trigger="trigger"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyTriggers')" />
    </CommonTableWrapper>
  </div>
</template>
