<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const activityStore = useActivityStore()

const fundingPayments = computed(() => activityStore.subaccountFundingPayments)
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <!-- mobile table -->
    <CommonTableBody
      :is-empty="fundingPayments.length === 0"
      class="sm:hidden mt-3 max-h-lg overflow-y-auto"
    >
      <PartialsCommonSubaccountFundingPaymentMobile
        v-for="(fundingPayment, index) in fundingPayments"
        :key="`mobile-funding-payment-${index}`"
        :funding-payment="fundingPayment"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('fundingPayments.emptyFundingPayments')"
          class="pb-4 grow bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper is-break-md class="hidden sm:block">
      <table v-if="fundingPayments.length > 0" class="table">
        <PartialsCommonSubaccountFundingPaymentHeader />
        <tbody>
          <PartialsCommonSubaccountFundingPaymentRow
            v-for="(fundingPayment, index) in fundingPayments"
            :key="`funding-payments-${index}-${fundingPayment.marketId}`"
            :funding-payment="fundingPayment"
          />
        </tbody>
      </table>

      <CommonEmptyList
        v-else
        data-cy="universal-table-nothing-found"
        :message="$t('fundingPayments.emptyFundingPayments')"
        class="pb-4 grow"
      />
    </CommonTableWrapper>
  </AppHocLoading>
</template>
