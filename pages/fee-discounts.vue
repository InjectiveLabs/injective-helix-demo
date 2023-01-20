<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const paramStore = useParamStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([
    exchangeStore.fetchParams(),
    exchangeStore.fetchFeeDiscountSchedule(),
    exchangeStore.fetchFeeDiscountAccountInfo(),
    paramStore.fetchAprParams()
  ])
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

onBeforeUnmount(() => {
  exchangeStore.reset()
})
</script>

<template>
  <div
    class="h-full w-full flex flex-wrap fee-discounts min-h-screen-excluding-header-and-footer"
  >
    <AppHocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <div class="my-12">
            <h3 class="text-xl font-bold text-gray-200">
              {{ $t('fee_discounts.page_title') }}
            </h3>
            <div class="mt-6 mb-8">
              <p class="text-sm font-normal mb-2">
                {{ $t('fee_discounts.page_description') }}
              </p>
              <p class="text-sm text-blue-500 font-normal">
                {{ $t('fee_discounts.page_description_warning') }}
              </p>
            </div>
            <PartialsFeeDiscountsOverview class="my-8" />
            <AppPanel>
              <PartialsFeeDiscounts />
            </AppPanel>
          </div>
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>

<style scoped>
.fee-discounts {
  background: url('@/assets/fee-discounts-background-mobile.svg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
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
