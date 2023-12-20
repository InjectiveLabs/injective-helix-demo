<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  executionOrderTypeToOrderExecutionTypes,
  executionOrderTypeToOrderTypes
} from '@/app/client/utils/activity'
import {
  ActivityField,
  ActivityForm,
  BusEvents,
  PaginationState
} from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const formValues = useFormValues<ActivityForm>()

const { limit, page, skip, updateRouteQuery, getPaginationState, totalPages } =
  usePagination({
    totalCount: toRef(spotStore, 'subaccountOrderHistoryCount')
  })

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  useEventBus(BusEvents.ActivityFilterUpdate).on(fetchData)
})

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

function fetchData() {
  status.setLoading()

  const marketIds = (
    formValues.value[ActivityField.Denom]
      ? spotStore.markets.filter((m) => {
          return [m.quoteToken.denom, m.baseToken.denom].some((denom) =>
            denom
              .toLowerCase()
              .startsWith(formValues.value[ActivityField.Denom].toLowerCase())
          )
        })
      : spotStore.markets
  ).map((m) => m.marketId)

  const orderTypes =
    formValues.value[ActivityField.Type] &&
    executionOrderTypeToOrderTypes(formValues.value[ActivityField.Type])

  const executionTypes =
    formValues.value[ActivityField.Type] &&
    executionOrderTypeToOrderExecutionTypes(
      formValues.value[ActivityField.Type]
    )

  Promise.all([
    spotStore.fetchSubaccountOrderHistory({
      pagination: {
        skip: skip.value,
        limit: limit.value
      },
      filters: {
        direction: formValues.value.Side,
        orderTypes,
        executionTypes,
        marketIds
      }
    })
  ])
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
    <div class="space-y-10">
      <PartialsActivityViewsSpotOrderHistory />

      <AppPagination
        v-bind="{
          page,
          limit,
          totalCount: spotStore.subaccountOrderHistoryCount
        }"
        @update:limit="onLimitChangeEvent"
        @update:page="onPageChangeEvent"
      />
    </div>
  </AppHocLoading>
</template>
