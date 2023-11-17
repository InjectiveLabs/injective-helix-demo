<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { INJ_COIN_GECKO_ID } from '@injectivelabs/sdk-ui-ts'
import { MainPage } from '@/types'
import { LP_EPOCHS } from '@/app/data/guild'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { error } = useNotifications()

// WE WILL USE THIS LATER - WE HAVE TO HARDCODE 1 FOR NOW BELOW
// const latestEpoch = Math.max(...LP_EPOCHS.map(({ epoch }) => epoch))

const page = ref(1)
const limit = ref(10)
const epoch = useQueryRef('epoch', '1')

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const campaign = computed(() =>
  LP_EPOCHS.find((ep) => ep.epoch === Number(epoch.value))
)

onWalletConnected(() => {
  if (!campaign.value) {
    error({ title: t('campaign.campaignNotFound') })
    navigateTo({ name: MainPage.Index })
  }
  Promise.all([
    tokenStore.fetchTokensUsdPriceMap([INJ_COIN_GECKO_ID]),
    campaignStore.fetchCampaign({
      skip: 0,
      limit: limit.value,
      campaignId: campaign.value!.campaignId
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
      campaignId: campaign.value!.campaignId
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

function updateEpoch(value: string) {
  epoch.value = value
}

useIntervalFn(
  () => tokenStore.fetchTokensUsdPriceMap([INJ_COIN_GECKO_ID]),
  30 * 1000
)

watch(epoch, () => fetchCampaign({ skip: 0 }))
</script>

<template>
  <AppHocLoading
    :is-loading="status.isLoading() || !campaignStore.campaign"
    class="h-full container"
  >
    <div
      v-if="campaignStore.campaign"
      class="mx-auto max-w-7xl w-full px-4 space-y-8"
    >
      <PartialsLiquidityHeader
        v-bind="{
          market,
          campaign: campaignStore.campaign,
          epoch
        }"
        @update:epoch="updateEpoch"
      />

      <PartialsLiquidityRewardStats
        v-bind="{
          totalScore: campaignStore.campaign.totalScore,
          quoteDecimals: market?.quoteToken.decimals || 6,
          campaign: campaignStore.campaign
        }"
      />

      <PartialsLiquidityTab :date="campaignStore.campaign.lastUpdated" />

      <AppHocLoading :is-loading="tableStatus.isLoading()">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[742px]">
            <PartialsLiquidityTableHeader />
            <tbody>
              <PartialsLiquidityTableRow
                v-for="campaignUser in campaignStore.campaignUsers"
                :key="campaignUser.accountAddress"
                v-bind="{
                  campaign: campaignStore.campaign,
                  campaignUser,
                  totalScore: campaignStore.campaign.totalScore,
                  quoteDecimals: market?.quoteToken.decimals || 6
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
