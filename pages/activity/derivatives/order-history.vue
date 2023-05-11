<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm, BusEvents, PaginationState } from '@/types'
import {
  executionOrderTypeToOrderExecutionTypes,
  executionOrderTypeToOrderTypes
} from '@/app/client/utils/activity'

const route = useRoute()
const formValues = useFormValues<ActivityForm>()
const derivativeStore = useDerivativeStore()

const { limit, page, skip, updateRouteQuery, getPaginationState, totalPages } =
  usePagination({
    totalCount: toRef(derivativeStore, 'subaccountOrderHistoryCount')
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

  const marketIds = derivativeStore.markets
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
    executionOrderTypeToOrderExecutionTypes(formValues.value.Type)

  Promise.all([
    derivativeStore.fetchSubaccountOrderHistory({
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
  () => {
    fetchData()
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <AppHocLoading :status="status">
      <div class="space-y-4 pb-10">
        <PartialsActivityViewsDerivativesOrderHistory />

        <AppPagination
          v-bind="{
            page,
            limit,
            totalCount: derivativeStore.subaccountOrderHistoryCount
          }"
          @update:limit="handleLimitChangeEvent"
          @update:page="handlePageChangeEvent"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
