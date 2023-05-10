<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm } from '@/types'

const route = useRoute()
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
  <PartialsActivitySubaccounts />

  <div class="pt-6 h-full-flex">
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

  <ModalsAddMargin />
</template>
