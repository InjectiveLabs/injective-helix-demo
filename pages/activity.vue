<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm } from '@/types'

definePageMeta({
  middleware: [
    'connected',
    (to) => {
      if (to.name === 'activity') {
        return navigateTo({ name: 'activity-positions' })
      }
    }
  ]
})

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const activityStore = useActivityStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { resetForm } = useForm<ActivityForm>({
  keepValuesOnUnmount: true
})

const status = reactive(new Status(StatusType.Loading))

onUnmounted(() => {
  activityStore.$reset()
  derivativeStore.resetSubaccount()
  spotStore.resetSubaccount()
})

function fetchData() {
  status.setLoading()
  appStore.cancelAllStreams()

  Promise.all([
    activityStore.streamDerivativeSubaccountOrderHistory(),
    activityStore.streamDerivativeSubaccountTrades(),
    activityStore.streamSpotSubaccountOrderHistory(),
    activityStore.streamSpotSubaccountTrades(),
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.streamMarketsMarkPrices(),
    derivativeStore.fetchSubaccountConditionalOrders(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions(),
    positionStore.streamSubaccountPositions(),
    spotStore.fetchSubaccountOrders(),
    spotStore.streamSubaccountOrders()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(() => accountStore.subaccountId, fetchData, { immediate: true })
watch(() => route.name, resetForm)
</script>

<template>
  <div class="container h-full max-h-screen-excluding-header min-h-lg">
    <div
      class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative h-full-excluding-header"
    >
      <PartialsActivitySubaccounts />

      <PartialsActivityCommonNavigation
        v-bind="{
          status
        }"
      />

      <div class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t" />
      <AppHocLoading v-bind="{ status }">
        <NuxtPage />
      </AppHocLoading>
    </div>
  </div>
</template>
