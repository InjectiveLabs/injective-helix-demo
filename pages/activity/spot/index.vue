<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const spotStore = useSpotStore()

const status = reactive(new Status(StatusType.Loading))

function fetchData() {
  status.setLoading()

  spotStore.fetchSubaccountOrders().finally(() => {
    status.setIdle()
  })
}
watch(
  () => route.fullPath,
  () => {
    fetchData()
  },
  { immediate: true }
)
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div>
      <PartialsActivityViewsSpot />
    </div>
  </AppHocLoading>
</template>
