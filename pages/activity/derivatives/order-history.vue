<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  ActivityField,
  ActivityForm,
  BusEvents,
  PaginationState
} from '@/types'
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
      ? derivativeStore.markets.filter((m) =>
          [m.quoteToken.denom, m.baseToken.denom].some((denom) =>
            denom
              .toLowerCase()
              .startsWith(formValues.value[ActivityField.Denom].toLowerCase())
          )
        )
      : derivativeStore.markets
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
          @update:limit="onLimitChangeEvent"
          @update:page="onPageChangeEvent"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
