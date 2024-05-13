<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { MainPage } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { error } = useNotifications()

const page = ref(1)
const limit = ref(10)

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const campaign = computed(() => route.query.campaign as string)

onWalletConnected(() => {
  if (!campaign.value) {
    error({ title: t('campaign.campaignNotFound') })
    navigateTo({ name: MainPage.Index })
  }

  Promise.all([
    campaignStore.fetchCampaign({
      skip: 0,
      limit: limit.value,
      campaignId: campaign.value
    })
  ])
    .then(() => {
      if (!campaignStore.campaign) {
        error({ title: t('campaign.campaignNotFound') })
        navigateTo({ name: MainPage.Index })
      }
    })
    .catch($onError)
    .finally(() => status.setIdle())
})

const market = computed(() => {
  const campaign = campaignStore.campaign

  if (!campaign) {
    return
  }

  return spotStore.markets.find(
    ({ marketId }) => marketId === campaign.marketId
  )
})

function fetchCampaign({ skip }: { skip: number }) {
  tableStatus.setLoading()

  campaignStore
    .fetchCampaign({
      skip,
      limit: limit.value,
      campaignId: campaign.value
    })
    .then(() => {
      if (!campaignStore.campaign) {
        error({ title: t('campaign.campaignNotFound') })
        navigateTo({ name: MainPage.Index })
      }
    })
    .catch($onError)
    .finally(() => tableStatus.setIdle())
}

function onLimitChange(value: number) {
  page.value = 1
  limit.value = value

  fetchCampaign({ skip: 0 })
}

function onPageChange(value: number) {
  page.value = value

  fetchCampaign({ skip: (Number(page.value) - 1) * limit.value })
}
</script>

<template>
  <AppHocLoading
    :is-loading="status.isLoading() || !campaignStore.campaign"
    class="h-full container"
  >
    <div
      v-if="campaignStore.campaign"
      class="mx-auto max-w-7xl w-full px-4 space-y-8 mt-6"
    >
      <PartialsLiquidityCampaignHeader
        v-if="market"
        v-bind="{ market, campaign: campaignStore.campaign }"
      />

      <PartialsLiquidityCampaignRewardStats
        v-bind="{
          totalScore: campaignStore.campaign.totalScore,
          quoteDecimals: market?.quoteToken.decimals || 6,
          campaign: campaignStore.campaign
        }"
      />

      <PartialsLiquidityCampaignTab
        :date="campaignStore.campaign.lastUpdated"
      />

      <AppHocLoading :is-loading="tableStatus.isLoading()">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[742px]">
            <PartialsLiquidityCampaignTableHeader />

            <tbody v-if="market">
              <PartialsLiquidityCampaignTableRow
                v-for="campaignUser in campaignStore.campaignUsers"
                :key="campaignUser.accountAddress"
                v-bind="{
                  campaign: campaignStore.campaign,
                  campaignUser,
                  totalScore: campaignStore.campaign.totalScore,
                  quoteDecimals: market?.quoteToken.decimals || 6,
                  market
                }"
              />
            </tbody>
          </table>
        </div>
      </AppHocLoading>

      <AppPagination
        v-if="campaignStore.totalUserCount > 0"
        class="pt-6 pb-12"
        v-bind="{ limit, page, totalCount: campaignStore.totalUserCount }"
        @update:limit="onLimitChange"
        @update:page="onPageChange"
      />
    </div>
  </AppHocLoading>
</template>
