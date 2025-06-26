<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  status.setLoading()

  Promise.all([exchangeStore.fetchFeeDiscountAccountInfo()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading :status="status">
    <div class="max-lg:hidden my-8 grid grid-cols-12 gap-6">
      <PartialsFeeDiscountsTierInfo class="md:col-span-6" />
      <PartialsFeeDiscountsStakedAmount class="md:col-span-3" />
      <PartialsFeeDiscountsTradingVolume class="md:col-span-3" />
    </div>

    <AppCarousel class="my-8 hidden max-lg:block">
      <PartialsFeeDiscountsTierInfo class="embla__slide" />
      <PartialsFeeDiscountsStakedAmount class="embla__slide" />
      <PartialsFeeDiscountsTradingVolume class="embla__slide" />
    </AppCarousel>
  </AppHocLoading>
</template>
