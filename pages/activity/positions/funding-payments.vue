<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm, BusEvents, PaginationState } from '@/types'

const route = useRoute()
const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Loading))
const { limit, getPaginationState, page, skip, totalPages, updateRouteQuery } =
  usePagination({
    totalCount: toRef(activityStore, 'subaccountFundingPaymentsCount')
  })
const formValues = useFormValues<ActivityForm>()

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
  const marketIds = derivativeStore.markets
    .filter((market) =>
      [market.baseToken.symbol, market.quoteToken.symbol].includes(
        formValues.value.Denom &&
          (formValues.value.Denom as string).toUpperCase()
      )
    )
    .map((m) => m.marketId)

  status.setLoading()

  activityStore
    .fetchSubaccountFundingPayments({
      pagination: {
        limit: limit.value,
        skip: skip.value
      },
      filters: {
        marketIds: marketIds || undefined
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

watch(
  () => route.fullPath,
  () => {
    fetchData()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-4">
    <AppHocLoading v-bind="{ status }">
      <div class="space-y-4 pb-10">
        <PartialsActivityViewsPositionsFundingPayments />

        <AppPagination
          v-bind="{
            limit,
            page,
            totalCount: activityStore.subaccountFundingPaymentsCount
          }"
          @update:limit="onLimitChangeEvent"
          @update:page="onPageChangeEvent"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
