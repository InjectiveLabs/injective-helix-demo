<script lang="ts" setup>
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { format } from 'date-fns'
import { INJ_COIN_GECKO_ID, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import {
  USDT_DECIMALS,
  DATE_TIME_DISPLAY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
} from '@/app/utils/constants'

const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const { rewardsCampaign, campaignInfo, poolCampaignScheduleList } =
  useTradeReward()

const tradeRewardPoints = computed(() => {
  if (!exchangeStore.tradeRewardsPoints.length) {
    return ZERO_IN_BASE
  }

  const [points] = exchangeStore.tradeRewardsPoints

  if (!points) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(cosmosSdkDecToBigNumber(points))
})

const stakedAmount = computed(() => {
  if (!exchangeStore.feeDiscountAccountInfo) {
    return ZERO_IN_BASE
  }

  if (!exchangeStore.feeDiscountAccountInfo.accountInfo) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    )
  )
})

const tradeRewardPointsFactored = computed(() =>
  new BigNumberInWei(tradeRewardPoints.value).toBase(USDT_DECIMALS)
)

const totalTradeRewardPointsFactored = computed(() =>
  new BigNumberInWei(totalTradeRewardPoints.value).toBase(USDT_DECIMALS)
)

const campaignDurationInSeconds = computed(() => {
  if (!campaignInfo.value) {
    return 0
  }

  return new BigNumberInBase(
    campaignInfo.value.campaignDurationSeconds || 0
  ).toNumber()
})

const currentEpochStartTimestamp = computed(() => {
  if (!poolCampaignScheduleList.value) {
    return 0
  }

  const [schedule] = poolCampaignScheduleList.value

  if (!schedule) {
    return 0
  }

  return new BigNumberInBase(schedule.startTimestamp).toNumber()
})

const epochCountdown = computed(() =>
  format(
    (currentEpochStartTimestamp.value + campaignDurationInSeconds.value) * 1000,
    DATE_TIME_DISPLAY
  )
)

const injMaxCampaignRewards = computed(() => {
  if (!poolCampaignScheduleList.value) {
    return ZERO_IN_BASE
  }

  const [schedule] = poolCampaignScheduleList.value

  if (!schedule) {
    return ZERO_IN_BASE
  }

  const [inj] = schedule.maxCampaignRewardsList

  if (!inj) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(cosmosSdkDecToBigNumber(inj.amount || 0))
})

const injUsdPrice = computed(() => {
  const injUsdPrice = tokenStore.tokenUsdPrice(INJ_COIN_GECKO_ID)

  return injUsdPrice || ZERO_IN_BASE
})

const injMaxCampaignRewardsInUsd = computed(() =>
  injMaxCampaignRewards.value.multipliedBy(
    new BigNumberInBase(injUsdPrice.value)
  )
)

const totalTradeRewardPoints = computed(
  () =>
    new BigNumberInBase(
      cosmosSdkDecToBigNumber(
        rewardsCampaign.value?.totalTradeRewardPoints || 0
      )
    )
)

const estimatedRewards = computed(() => {
  if (totalTradeRewardPoints.value.lte(0)) {
    return ZERO_IN_BASE
  }

  const estRewards = tradeRewardPoints.value
    .dividedBy(totalTradeRewardPoints.value)
    .times(injMaxCampaignRewards.value)

  if (estRewards.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
    return estRewards
  }

  if (stakedAmount.value.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
    return new BigNumberInBase(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)
  }

  return estRewards.gte(stakedAmount.value) ? stakedAmount.value : estRewards
})

const estimatedRewardsInUsd = computed(() =>
  estimatedRewards.value.multipliedBy(new BigNumberInBase(injUsdPrice.value))
)

onMounted(() => {
  Promise.all([exchangeStore.fetchTradeRewardPoints()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppPanel :title="$t('tradeAndEarn.currentEpoch')" card-wrapper-class="mt-6">
    <template v-if="currentEpochStartTimestamp > 0" #title-context>
      <span class="text-gray-200">
        {{ $t('tradeAndEarn.campaignEndingOn', { date: epochCountdown }) }}
      </span>
    </template>
    <AppHocLoading :status="status">
      <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
        <PartialsCommonStatsItem class="col-span-2 lg:col-span-4">
          <template #value>
            <AppNumberEmp
              :number="injMaxCampaignRewards"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span>INJ</span>
            </AppNumberEmp>

            <AppNumberEmp
              class="text-gray-450"
              is-sm
              prefix="≈"
              :number="injMaxCampaignRewardsInUsd"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span>USD</span>
            </AppNumberEmp>
          </template>

          <template #title>
            <div class="flex items-center justify-center text-gray-450 text-xs">
              {{ $t('tradeAndEarn.maxCampaignRewards') }}
              <AppTooltip
                class="ml-2 text-gray-450"
                :content="$t('tradeAndEarn.maxCampaignRewardsTooltip')"
              />
            </div>
          </template>
        </PartialsCommonStatsItem>
        <PartialsCommonStatsItem class="col-span-2 lg:col-span-4">
          <template #value>
            <div
              v-if="walletStore.isUserWalletConnected"
              class="flex flex-wrap justify-center"
            >
              <AppNumberEmp :number="tradeRewardPointsFactored">
                <span>{{ $t('tradeAndEarn.pts') }}</span>
              </AppNumberEmp>
              <span class="px-2 text-xl self-center">/</span>
              <AppNumberEmp :number="totalTradeRewardPointsFactored">
                <span>{{ $t('tradeAndEarn.pts') }}</span>
              </AppNumberEmp>
            </div>
            <span v-else class="text-gray-450">&mdash;</span>
          </template>

          <template #title>
            <div
              class="flex items-center justify-center text-xs text-gray-450 3xl:whitespace-nowrap -ml-2"
            >
              {{ $t('tradeAndEarn.myRewardPoints') }}
              <AppTooltip
                class="ml-2 text-gray-450"
                :content="$t('tradeAndEarn.myRewardPoints_tooltip')"
              />
            </div>
          </template>
        </PartialsCommonStatsItem>
        <PartialsCommonStatsItem class="col-span-2 lg:col-span-4">
          <template #value>
            <AppNumberEmp
              v-if="walletStore.isUserWalletConnected"
              :number="estimatedRewards"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span>INJ</span>
            </AppNumberEmp>
            <span v-else>&mdash;</span>
            <AppNumberEmp
              v-if="walletStore.isUserWalletConnected"
              is-sm
              class="text-gray-450"
              prefix="≈"
              :number="estimatedRewardsInUsd"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span class="text-sm">USD</span>
            </AppNumberEmp>
          </template>

          <template #title>
            <div class="flex items-center justify-center text-xs text-gray-450">
              {{ $t('tradeAndEarn.estRewards') }}
              <AppTooltip
                class="ml-2 text-gray-450"
                :content="
                  $t('tradeAndEarn.estRewardsTooltip', {
                    maxRewards: DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
                  })
                "
              />
            </div>
          </template>
        </PartialsCommonStatsItem>
      </div>
    </AppHocLoading>
  </AppPanel>
</template>
