<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  executionOrderTypeToOrderTypes,
  executionOrderTypeToTradeExecutionTypes
} from '@/app/client/utils/activity'
import { ActivityForm, BusEvents, PaginationState } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const formValues = useFormValues<ActivityForm>()

const { limit, page, skip, updateRouteQuery, getPaginationState, totalPages } =
  usePagination({
    totalCount: toRef(spotStore, 'subaccountTradesCount')
  })

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  useEventBus(BusEvents.ActivityFilterUpdate).on(fetchData)
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

function fetchData() {
  status.setLoading()

  const marketIds = spotStore.markets
    .filter((m) =>
      [
        m.quoteToken.denom,
        m.baseToken.denom,
        m.quoteToken.symbol,
        m.baseToken.symbol
      ].some((denom) =>
        denom
          .toLowerCase()
          .includes((formValues.value.Denom as string).toLowerCase())
      )
    )
    .map((m) => m.marketId)

  const orderTypes =
    formValues.value.Type &&
    executionOrderTypeToOrderTypes(formValues.value.Type)

  const executionTypes =
    formValues.value.Type &&
    executionOrderTypeToTradeExecutionTypes(formValues.value.Type)

  Promise.all([
    spotStore.fetchSubaccountTrades({
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
        handlePageChangeEvent(totalPages.value)
      }
    })
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => route.fullPath,
  () => fetchData,
  { immediate: true }
)
</script>

<template>
  <div>
    <AppHocLoading v-bind="{ status }">
      <div class="space-y-10 pb-10">
        <PartialsActivityViewsSpotTradeHistory />

        <AppPagination
          v-bind="{
            page,
            limit,
            totalCount: spotStore.subaccountTradesCount
          }"
          @update:limit="handleLimitChangeEvent"
          @update:page="handlePageChangeEvent"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
