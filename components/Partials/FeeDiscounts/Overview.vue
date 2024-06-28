<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const sharedWalletStore = useSharedWalletStore()
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
    <div v-if="sharedWalletStore.isUserConnected" class="my-8">
      <AppHorizontalScrollView>
        <PartialsFeeDiscountsTierInfo class="flex-0-full md:col-span-6" />
        <PartialsFeeDiscountsStakedAmount class="flex-0-full md:col-span-3" />
        <PartialsFeeDiscountsTradingVolume class="flex-0-full md:col-span-3" />
      </AppHorizontalScrollView>
    </div>
  </AppHocLoading>
</template>
