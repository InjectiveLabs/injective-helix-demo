<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const router = useRouter()
const swapStore = useSwapStore()
const { $onError } = useNuxtApp()

const isMobile = useIsMobile()

const status = reactive(new Status(StatusType.Loading))

const { limit, page, skip } = usePagination({
  totalCount: toRef(swapStore, 'swapHistoryTotal')
})

function fetchAtomicSwapHistory() {
  status.setLoading()

  swapStore
    .fetchAtomicSwapHistory({
      skip: skip.value,
      limit: limit.value
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

onWalletConnected(fetchAtomicSwapHistory)

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page
    }
  })

  fetchAtomicSwapHistory()
}

async function handleLimitChange(limit: number) {
  await router.push({
    query: {
      page: undefined,
      limit
    }
  })

  fetchAtomicSwapHistory()
}
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.swaps') }}</h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioHistorySwapTableHeader v-if="!isMobile" />

      <CommonSkeletonRow
        v-if="status.isLoading()"
        :rows="10"
        :columns="5"
        :height="57"
      />

      <template v-else>
        <div v-if="isMobile">
          <PartialsPortfolioHistorySwapTableMobileRow
            v-for="swap in swapStore.swapHistory"
            :key="`${swap.txHash}-${swap.indexBySender}`"
            v-bind="{ swap }"
          />
        </div>

        <template v-else>
          <PartialsPortfolioHistorySwapTableRow
            v-for="swap in swapStore.swapHistory"
            :key="`${swap.txHash}-${swap.indexBySender}`"
            v-bind="{ swap }"
          />
        </template>

        <AppPagination
          v-if="swapStore.swapHistory.length > 0"
          class="p-8"
          v-bind="{
            limit,
            page,
            totalCount: swapStore.swapHistoryTotal
          }"
          @update:limit="handleLimitChange"
          @update:page="handlePageChange"
        />

        <CommonEmptyList
          v-if="swapStore.swapHistory.length === 0"
          :message="$t('trade.emptyTrades')"
        />
      </template>
    </div>
  </div>
</template>
