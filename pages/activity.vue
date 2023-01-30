<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

const accountStore = useAccountStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([
    accountStore.fetchSubaccounts(),
    spotStore.init(),
    derivativeStore.init()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="w-full mx-auto px-6 3xl:px-0 3xl:w-11/12 4xl:w-10/12 h-full-flex">
    <AppHocLoading :status="status">
      <PartialsActivity />
    </AppHocLoading>
  </div>
</template>
