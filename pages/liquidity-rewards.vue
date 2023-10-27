<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { useCampaignStore } from 'store/campaign'

const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const CAMPAIGN_MARKET_ID =
  '0x3bdb3d8b5eb4d362371b72cf459216553d74abdb55eb0208091f7777dd85c8bb'

const page = ref(1)
const limit = ref(10)

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  onLimitChange()
})

function fetchCampaign({ skip }: { skip: number }) {
  status.setLoading()

  campaignStore
    .fetchCampaign({
      skip,
      limit: limit.value,
      marketId: CAMPAIGN_MARKET_ID
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function onLimitChange() {
  page.value = 1

  fetchCampaign({ skip: 0 })
}

// function onPageChange() {
//   fetchCampaign({ skip: (Number(page.value) - 1) * limit.value })
// }
</script>

<template>
  <div class="mx-auto max-w-7xl w-full px-4 space-y-8">
    <PartialsLiquidityHeader />
    <PartialsLiquidityRewardStats />
    <PartialsLiquidityTab />

    <div class="overflow-x-auto">
      <pre>{{ campaignStore.campaign }}</pre>

      <table class="w-full min-w-[742px]">
        <PartialsLiquidityTableHeader />
        <tbody>
          <PartialsLiquidityTableRow v-for="i in 10" :key="`row-${i}`" />
        </tbody>
      </table>
    </div>

    <AppPagination v-bind="{ limit: 10, page: 3, totalCount: 100 }" />
  </div>
</template>
