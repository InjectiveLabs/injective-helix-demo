<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { getExplorerUrl, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Campaign } from '@injectivelabs/sdk-ts'
import { addDays, differenceInHours } from 'date-fns'
import {
  NETWORK,
  CAMPAIGN_INJ_REWARDS,
  CAMPAIGN_TIA_REWARDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { toBalanceInToken } from '@/app/utils/formatters'
import { LP_EPOCHS } from 'app/data/guild'

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

const status = reactive(new Status(StatusType.Loading))
const claimStatus = reactive(new Status(StatusType.Idle))

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

  return new BigNumberInBase(campaignStore.ownerCampaignInfo.score)
    .dividedBy(props.totalScore)
    .times(100)
})

const { valueToString: estRewardsInINJToString } = useBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(estRewardsInPercentage.value)
      .dividedBy(100)
      .multipliedBy(CAMPAIGN_INJ_REWARDS)
  ),
  {
    decimalPlaces: estRewardsInPercentage.value.gt(0.1)
      ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
      : UI_DEFAULT_MAX_DISPLAY_DECIMALS
  }
)

const { valueToString: estRewardsInTIAToString } = useBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(estRewardsInPercentage.value)
      .dividedBy(100)
      .multipliedBy(CAMPAIGN_TIA_REWARDS)
  ),
  {
    decimalPlaces: estRewardsInPercentage.value.gt(0.1)
      ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
      : UI_DEFAULT_MAX_DISPLAY_DECIMALS
  }
)

onWalletConnected(() => {
  fetchOwnerInfo()
})

function fetchOwnerInfo() {
  status.setLoading()

  campaignStore
    .fetchCampaignOwnerInfo(props.campaign.campaignId)
    .catch($onError)
    .finally(() => status.setIdle())
}

function claimRewards() {
  const scContract = LP_EPOCHS.find(
    (e) => e.campaignId === props.campaign.campaignId
  )?.scAddress

  if (!scContract) {
    return
  }

  claimStatus.setLoading()

  campaignStore
    .claimReward(scContract)
    .then(() => {
      success({
        title: t('campaign.success'),
        description: t('campaign.succesfulyClaimedRewards')
      })
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

const claimDate = computed(() => addDays(props.campaign.endDate, 1))

const isClaimable = computed(() => Date.now() > claimDate.value.getTime())

const readyIn = computed(() =>
  differenceInHours(claimDate.value.getTime(), Date.now())
)

const isClaimButtonShowed = computed(() => readyIn.value < 24)

useIntervalFn(() => {
  campaignStore.fetchCampaignOwnerInfo(props.campaign.campaignId)
}, 30 * 1000)

watch(() => props.campaign.campaignId, fetchOwnerInfo)
</script>

<template>
  <div
    v-if="campaignStore.ownerCampaignInfo || status.isLoading()"
    class="bg-gray-850 rounded-md p-8"
  >
    <AppHocLoading :status="status">
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
                  <p>{{ estRewardsInINJToString }} INJ,</p>
                  <p>{{ estRewardsInTIAToString }} TIA</p>
                </div>
              </div>
            </div>

            <div v-if="isClaimButtonShowed" class="whitespace-nowrap">
              <AppButton
                :disabled="!isClaimable"
                class="border border-blue-500 mb-1"
                xs
                v-bind="{ isLoading: claimStatus.isLoading() }"
                @click="claimRewards"
              >
                <div class="text-blue-500 font-semibold">
                  {{ $t('campaign.claim') }}
                </div>
              </AppButton>

              <p v-if="readyIn > 0" class="text-xs text-gray-500">
                ({{ $t('campaign.readyIn', { hours: readyIn }) }})
              </p>

              <p
                v-else-if="readyIn === 0 && !isClaimable"
                class="text-xs text-gray-500"
              >
                ({{
                  $t('campaign.readyInLessThan', { time: '1', interval: 'hr' })
                }})
              </p>
            </div>
          </div>
        </div>
      </template>
    </AppHocLoading>
  </div>
</template>
