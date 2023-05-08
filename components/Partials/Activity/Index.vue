<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '@/app/utils/constants'
import { ActivityTab, ActivityView, ActivityForm, ActivityField } from '@/types'

const spotStore = useSpotStore()
const bridgeStore = useBridgeStore()
const activityStore = useActivityStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { resetForm, setFieldValue } = useForm<ActivityForm>({
  keepValuesOnUnmount: true
})

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  refetchData()
})

onUnmounted(() => {
  activityStore.$reset()
  derivativeStore.resetSubaccount()
  spotStore.resetSubaccount()
})
</script>

<template>
  <PartialsActivitySubaccounts />

  <div class="pt-6 h-full-flex">
    <PartialsActivityCommonNavigation :status="status" />

    <div class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t" />

    <NuxtPage />
  </div>

  <ModalsAddMargin />
</template>
