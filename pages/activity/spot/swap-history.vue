<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PaginationState } from '@/types'

const route = useRoute()

const swapStore = useSwapStore()
const { $onError } = useNuxtApp()

const { limit, page, skip, updateRouteQuery, getPaginationState, totalPages } =
  usePagination({
    totalCount: computed(() => swapStore.swapHistoryTotal)
  })

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  fetchAtomicSwapHistory()
})

function handleLimitChangeEvent(limit: number) {
  updateRouteQuery({
    limit: `${limit}`
  })
}

function handlePageChangeEvent(page: number) {
  updateRouteQuery({
    page: page > 1 ? `${page}` : undefined,
    limit: `${limit.value}`
  })
}

function fetchAtomicSwapHistory() {
  status.setLoading()

  swapStore
    .fetchAtomicSwapHistory({
      skip: skip.value,
      limit: limit.value
    })
    .then(() => {
      const state = getPaginationState()

      if (state === PaginationState.InvalidQuery) {
        updateRouteQuery({ page: undefined })
      }

      if (state === PaginationState.QueryMoreThanTotalPage) {
        handlePageChangeEvent(totalPages.value)
      }
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

watch(
  () => route.fullPath,
  () => {
    fetchAtomicSwapHistory()
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <AppHocLoading v-bind="{ status }">
      <div class="space-y-10 pb-10">
        <PartialsActivityViewsSpotSwapHistory />

        <AppPagination
          v-bind="{
            page,
            limit,
            totalCount: swapStore.swapHistoryTotal
          }"
          @update:limit="handleLimitChangeEvent"
          @update:page="handlePageChangeEvent"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
