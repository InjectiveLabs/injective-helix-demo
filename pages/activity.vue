<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([spotStore.init(), derivativeStore.init()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading :status="status" class="h-full">
    <div class="container h-full max-h-screen-excluding-header min-h-lg">
      <div
        class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative h-full-excluding-header"
      >
        <PartialsActivity />
      </div>
    </div>
  </AppHocLoading>
</template>
