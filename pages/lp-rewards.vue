<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { INJ_COIN_GECKO_ID } from '@injectivelabs/sdk-ui-ts'
import { WritableComputedRef } from 'nuxt/dist/app/compat/capi'
import { MainPage } from '@/types'
import { LP_EPOCHS } from 'app/data/guild'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { error } = useNotifications()

const page = ref(1)
const limit = ref(10)
const epoch = useQueryRef('epoch', '1') as WritableComputedRef<string>

const status = reactive(new Status(StatusType.Loading))
const tableStatus = reactive(new Status(StatusType.Idle))

const campaign = computed(() =>
  LP_EPOCHS.find((ep) => ep.epoch === Number(epoch.value))
)

const epochOptions = computed(() =>
  LP_EPOCHS.filter(({ startDate }) => startDate * 1000 < Date.now()).map(
    (ep) => ({
      display: `EPOCH ${ep.epoch}`,
      value: ep.epoch.toString()
    })
  )
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
          campaign: campaignStore.campaign
        }"
      />

      <div class="flex">
        <AppSelect
          v-model="epoch"
          start-placement
          v-bind="{
            options: epochOptions,
            wrapperClass: 'border px-4 py-1 rounded'
          }"
        >
          <template #default="{ selected }">
            <span class="font-bold select-none">
              {{ selected?.display }}
            </span>
          </template>

          <template #option="{ option }">
            <span class="font-bold">
              {{ option.display }}
            </span>
          </template>
        </AppSelect>
      </div>

      <PartialsLiquidityRewardStats
        v-bind="{
          totalScore: campaignStore.campaign.totalScore,
          isClaimable: campaignStore.campaign.isClaimable,
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
