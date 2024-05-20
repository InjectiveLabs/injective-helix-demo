<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<{
  market: string
}>()

const status = reactive(new Status(StatusType.Loading))

const { limit, page, skip } = usePagination({
  totalCount: toRef(activityStore, 'subaccountFundingPaymentsCount')
})

function fetchFundingPayments() {
  status.setLoading()

  const marketIds = formValues.market ? [formValues.market] : undefined

  activityStore
    .fetchSubaccountFundingPayments({
      pagination: {
        limit: limit.value,
        skip: skip.value
      },
      filters: {
        marketIds
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onSubaccountChange(() => {
  fetchFundingPayments()
})

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchFundingPayments()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchFundingPayments()
}
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.fundingPayments') }}</h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioHistoryFundingTabs
        @market:update="fetchFundingPayments"
        @form:reset="fetchFundingPayments"
      />

      <PartialsPortfolioHistoryFundingTableHeader />

      <CommonSkeletonRow
        v-if="status.isLoading()"
        :rows="10"
        :columns="5"
        :height="57"
      />

      <template v-else>
        <PartialsPortfolioHistoryFundingTableRow
          v-for="fundingPayment in activityStore.subaccountFundingPayments"
          :key="`${fundingPayment.amount}-${fundingPayment.marketId}-${fundingPayment.subaccountId}-${fundingPayment.timestamp}`"
          v-bind="{ fundingPayment }"
        />

        <AppPagination
          v-if="activityStore.subaccountFundingPayments.length > 0"
          class="p-8"
          v-bind="{
            limit,
            page,
            totalCount: activityStore.subaccountFundingPaymentsCount
          }"
          @update:limit="handleLimitChange"
          @update:page="handlePageChange"
        />

        <CommonEmptyList
          v-if="activityStore.subaccountFundingPayments.length === 0"
          :message="$t('fundingPayments.emptyFundingPayments')"
        />
      </template>
    </div>
  </div>
</template>
