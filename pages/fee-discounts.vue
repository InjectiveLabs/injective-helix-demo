<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const sharedParamStore = useSharedParamStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([
    sharedParamStore.init(),
    exchangeStore.fetchParams(),
    exchangeStore.fetchFeeDiscountSchedule(),
    exchangeStore.fetchFeeDiscountAccountInfo()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading :status="status" is-full-screen>
    <div class="fee-discounts min-h-screen-excluding-header-and-footer">
      <div class="container mx-auto">
        <div class="w-full mx-auto xl:w-4/5">
          <div class="mt-6">
            <h3 class="text-xl font-bold text-coolGray-200">
              {{ $t(`feeDiscounts.page_title`) }}
            </h3>
            <div class="mt-6">
              <p class="text-sm font-normal mb-2">
                {{ $t('feeDiscounts.page_description') }}
              </p>
              <p class="text-sm text-blue-500 font-normal">
                {{ $t('feeDiscounts.page_description_warning') }}
              </p>
            </div>
            <PartialsFeeDiscountsOverview class="my-8" />
            <AppPanel>
              <PartialsFeeDiscounts />
            </AppPanel>
          </div>
        </div>
      </div>
    </div>
  </AppHocLoading>
</template>

<style scoped>
.fee-discounts {
  background: url('@/assets/fee-discounts-background-mobile.svg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  padding-top: 2rem;
}

@media (min-width: 480px) {
  .fee-discounts {
    background: url('@/assets/fee-discounts-background.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
}
</style>
