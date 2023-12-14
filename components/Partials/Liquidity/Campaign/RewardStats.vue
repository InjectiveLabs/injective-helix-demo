<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { getExplorerUrl, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Campaign } from '@injectivelabs/sdk-ts'
import {
  NETWORK,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { toBalanceInToken } from '@/app/utils/formatters'
import { LP_CAMPAIGNS } from '@/app/data/campaign'

const campaignStore = useCampaignStore()
const { success, error } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const props = defineProps({
  totalScore: {
    type: String,
    required: true
  },

  quoteDecimals: {
    type: Number,
    required: true
  },

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  }
})

const tokenStore = useTokenStore()

const hasUserClaimed = ref(false)
const status = reactive(new Status(StatusType.Loading))
const claimStatus = reactive(new Status(StatusType.Idle))

const campaignWithSc = computed(() =>
  LP_CAMPAIGNS.find(
    ({ campaignId }) => props.campaign.campaignId === campaignId
  )
)
const isClaimable = computed(() => Date.now() > props.campaign.endDate)

const explorerLink = computed(() => {
  if (!campaignStore.ownerCampaignInfo) {
    return
  }

  return `${getExplorerUrl(NETWORK)}/account/${
    campaignStore.ownerCampaignInfo.accountAddress
  }`
})

const { valueToString: volumeInUsdToString } = useBigNumberFormatter(
  computed(() => {
    if (!campaignStore.ownerCampaignInfo) {
      return 0
    }

    return toBalanceInToken({
      value: campaignStore.ownerCampaignInfo.score,
      decimalPlaces: props.quoteDecimals
    })
  })
)

const estRewardsInPercentage = computed(() => {
  if (
    !campaignStore.ownerCampaignInfo ||
    new BigNumberInBase(props.totalScore).isZero()
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(campaignStore.ownerCampaignInfo.score).dividedBy(
    props.totalScore
  )
})

const rewards = computed(() => {
  if (!campaignWithSc.value) {
    return []
  }

  return campaignWithSc.value.rewards.map((reward) => {
    const token = tokenStore.tokens.find(
      ({ symbol }) => symbol === reward.symbol
    )

    const amount = new BigNumberInBase(
      estRewardsInPercentage.value
    ).multipliedBy(reward.amount || 0)

    const amountInUsd = token
      ? new BigNumberInBase(amount).times(
          tokenStore.tokenUsdPriceMap[token.coinGeckoId]
        )
      : ZERO_IN_BASE

    return {
      amount,
      symbol: reward.symbol,
      amountInUsd
    }
  })
})

const rewardsFormatted = computed(() =>
  rewards.value.map((reward) => ({
    amount: reward.amount.toFormat(
      reward.amount.isLessThan(0.1)
        ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
        : UI_DEFAULT_MIN_DISPLAY_DECIMALS
    ),
    symbol: reward.symbol
  }))
)

onWalletConnected(() => {
  fetchOwnerInfo()
})

function fetchOwnerInfo() {
  status.setLoading()

  Promise.all([
    campaignStore.fetchUserClaimedStatus(campaignWithSc.value?.scAddress || ''),
    campaignStore.fetchCampaignOwnerInfo(props.campaign.campaignId)
  ])
    .then(([hasUserClaimedStatus]) => {
      hasUserClaimed.value = hasUserClaimedStatus || false
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function onClaimRewards() {
  const scAddress = campaignWithSc.value?.scAddress

  if (!scAddress) {
    return
  }

  claimStatus.setLoading()

  campaignStore
    .claimReward(scAddress)
    .then(() => {
      success({
        title: t('campaign.success'),
        description: t('campaign.successfullyClaimedRewards')
      })

      hasUserClaimed.value = true
    })
    .catch((er) => {
      if ((er.originalMessage as string).includes('has already claimed')) {
        error({
          title: t('campaign.error'),
          description: t('campaign.errorAlreadyClaimed')
        })
      } else {
        $onError(er)
      }
    })
    .finally(() => {
      claimStatus.setIdle()
    })
}

useIntervalFn(() => {
  campaignStore.fetchCampaignOwnerInfo(props.campaign.campaignId)
}, 30 * 1000)

watch(() => props.campaign.campaignId, fetchOwnerInfo)
</script>

<template>
  <AppHocLoading :status="status">
    <div
      v-if="campaignStore.ownerCampaignInfo"
      class="bg-gray-850 rounded-md p-8"
    >
      <template v-if="campaignStore.ownerCampaignInfo">
        <h2 class="font-semibold mb-4">{{ $t('campaign.rewardStats') }}</h2>

        <div class="flex">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 flex-1"
          >
            <div>
              <p class="text-xs uppercase pb-1">{{ $t('campaign.address') }}</p>
              <NuxtLink :to="explorerLink" target="_blank" class="text-sm">
                <p class="text-blue-500 truncate">
                  {{ campaignStore.ownerCampaignInfo.accountAddress }}
                </p>
              </NuxtLink>
            </div>

            <div>
              <p class="text-xs uppercase pb-1">{{ $t('campaign.volume') }}</p>
              <p class="text-sm">{{ volumeInUsdToString }} USD</p>
            </div>

            <div>
              <div class="text-xs uppercase pb-1 flex items-center space-x-2">
                <p>{{ $t('campaign.rewards') }}</p>
              </div>
              <div class="flex items-center justify-between gap-2">
                <div class="text-sm">
                  <p
                    v-for="{ amount, symbol } in rewardsFormatted"
                    :key="symbol"
                  >
                    {{ amount }} {{ symbol }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <AppButton
                class="border border-blue-500 mb-1"
                v-bind="{
                  isXs: true,
                  status: claimStatus,
                  isDisabled: !isClaimable || hasUserClaimed
                }"
                @click="onClaimRewards"
              >
                <div
                  class="font-semibold"
                  :class="{ 'text-blue-500': !hasUserClaimed }"
                >
                  {{ $t(`campaign.${hasUserClaimed ? 'claimed' : 'claim'}`) }}
                </div>
              </AppButton>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppHocLoading>
</template>
