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
  totalCount: toRef(activityStore, 'subaccountFundingHistoryCount')
})

function fetchFundingHistory() {
  status.setLoading()

  const marketIds = formValues.market ? [formValues.market] : undefined

  activityStore
    .fetchSubaccountFundingHistory({
      pagination: {
        skip: skip.value,
        limit: limit.value
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
  fetchFundingHistory()
})

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchFundingHistory()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      limit,
      page: undefined
    }
  })

  fetchFundingHistory()
}
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.fundingHistory') }}</h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioHistoryFundingTabs
        @market:update="fetchFundingHistory"
        @form:reset="fetchFundingHistory"
      />

      <CommonSkeletonRow
        v-if="status.isLoading()"
        :rows="10"
        :columns="5"
        :height="57"
      />

      <template v-else>
        <PartialsPortfolioHistoryFundingTable
          v-if="activityStore.subaccountFundingHistory.length"
          v-bind="{ fundingHistory: activityStore.subaccountFundingHistory }"
        />

        <AppPagination
          v-if="activityStore.subaccountFundingHistory.length"
          class="p-8"
          v-bind="{
            limit,
            page,
            totalCount: activityStore.subaccountFundingHistoryCount
          }"
          @update:limit="handleLimitChange"
          @update:page="handlePageChange"
        />

        <CommonEmptyList
          v-if="!activityStore.subaccountFundingHistory.length"
          :message="$t('fundingHistory.emptyFundingHistory')"
        />
      </template>
    </div>
  </div>
</template>
