<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})
const route = useRoute()
// const gridStore = useGridStore()

// async function handleFetchStrategies() {
//   await gridStore.fetchStrategies()
// }
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 flex text-gray-500 uppercase text-xs font-semibold">
      <NuxtLink
        :to="{
          name: 'spot-grid-trading-bots-market',
          params: { market: route.params.market }
        }"
        exact-active-class="text-blue-500"
      >
        Running
      </NuxtLink>

      <div class="border mx-4" />

      <NuxtLink
        :to="{
          name: 'spot-grid-trading-bots-market-history',
          params: { market: route.params.market }
        }"
        exact-active-class="text-blue-500 font-bold"
      >
        History
      </NuxtLink>
    </div>
    <CommonCardTableWrap class="flex-1">
      <CommonCard class="h-full flex-auto">
        <AppHocLoading v-bind="{ status }">
          <NuxtPage />
        </AppHocLoading>
      </CommonCard>
    </CommonCardTableWrap>
  </div>
</template>
