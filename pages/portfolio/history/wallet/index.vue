<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const router = useRouter()
const accountStore = useAccountStore()
const activityStore = useActivityStore()
const { $onError } = useNuxtApp()

const { values: formValues } = useForm<{
  token: string
}>()

const { limit, page, skip } = usePagination({
  totalCount: toRef(activityStore, 'subaccountTransferTransactionsCount')
})

const status = reactive(new Status(StatusType.Loading))

function fetchWalletTransfers() {
  status.setLoading()

  const denom = formValues.token ? formValues.token : undefined

  activityStore
    .fetchSubaccountTransfers({
      pagination: {
        limit: limit.value,
        skip: skip.value
      },

      filters: {
        denom
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(() => [accountStore.subaccountId, formValues], fetchWalletTransfers, {
  immediate: true,
  deep: true
})

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchWalletTransfers()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchWalletTransfers()
}
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.walletHistory') }}</h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioHistoryWalletTabs />
      <PartialsPortfolioHistoryWalletTableHeader />

      <CommonSkeletonRow
        v-if="status.isLoading()"
        :rows="10"
        :columns="5"
        :height="57"
      />

      <template v-else>
        <PartialsPortfolioHistoryWalletTableRow
          v-for="transaction in activityStore.subaccountTransfers"
          :key="`${transaction.timestamp}-${transaction.sender}-${transaction.receiver}-${transaction.denom}`"
          v-bind="{ transaction }"
        />

        <AppPagination
          v-if="activityStore.subaccountTransfers.length > 0"
          class="p-8"
          v-bind="{
            limit,
            page,
            totalCount: activityStore.subaccountTransferTransactionsCount
          }"
          @update:limit="handleLimitChange"
          @update:page="handlePageChange"
        />

        <CommonEmptyList
          v-if="activityStore.subaccountTransfers.length === 0"
          :message="$t('trade.emptyTrades')"
        />
      </template>
    </div>
  </div>
</template>
