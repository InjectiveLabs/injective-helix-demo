<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['auction']
})

const auctionStore = useAuctionStore()
const { $onError } = useNuxtApp()

const now = ref(Date.now())
const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  auctionStore
    .fetchMarkets()
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

useIntervalFn(() => {
  now.value = Date.now()
}, 1000)
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen">
    <AppHocLoading v-bind="{ status }">
      <NuxtPage />
    </AppHocLoading>
  </div>
</template>
