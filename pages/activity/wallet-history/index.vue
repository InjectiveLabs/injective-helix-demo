<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm, BusEvents, PaginationState } from '@/types'

const route = useRoute()
const bridgeStore = useBridgeStore()

const formValues = useFormValues<ActivityForm>()

const { limit, page, skip, updateRouteQuery, getPaginationState, totalPages } =
  usePagination({
    totalCount: toRef(bridgeStore, 'subaccountTransferBridgeTransactionsCount')
  })

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  useEventBus(BusEvents.ActivityFilterUpdate).on(fetchData)
})

function fetchData() {
  status.setLoading()

  bridgeStore
    .fetchSubaccountTransfers({
      pagination: {
        limit: limit.value,
        skip: skip.value
      },
      filters: {
        denom: formValues.value.Denom
      }
    })
    .then(() => {
      const state = getPaginationState()

      if (state === PaginationState.InvalidQuery) {
        updateRouteQuery({ page: undefined })
      }

      if (state === PaginationState.QueryMoreThanTotalPage) {
        onPageChangeEvent(totalPages.value)
      }
    })
    .finally(() => {
      status.setIdle()
    })
}

function onLimitChangeEvent(limit: number) {
  updateRouteQuery({
    limit: `${limit}`
  })
}

function onPageChangeEvent(page: number) {
  updateRouteQuery({
    page: page > 1 ? `${page}` : undefined,
    limit: `${limit.value}`
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
    <div class="space-y-10 pb-10">
      <PartialsActivityViewsWalletHistoryTransfers />

      <AppPagination
        v-bind="{
          page,
          limit,
          totalCount: bridgeStore.subaccountTransferBridgeTransactionsCount
        }"
        @update:limit="onLimitChangeEvent"
        @update:page="onPageChangeEvent"
      />
    </div>
  </AppHocLoading>
</template>
