<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE, getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import {
  NETWORK,
  CAMPAIGN_INJ_REWARDS,
  CAMPAIGN_TIA_REWARDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { toBalanceInToken } from '@/app/utils/formatters'

const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  isClaimable: Boolean,

  totalScore: {
    type: String,
    required: true
  },

  quoteDecimals: {
    type: Number,
    required: true
  }
})

const status = reactive(new Status(StatusType.Loading))

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
  status.setLoading()

  campaignStore
    .fetchCampaignOwnerInfo()
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(campaignStore.fetchCampaignOwnerInfo, 30 * 1000)
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
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1"
          >
            <div class="md:col-span-2">
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
              <p class="text-xs uppercase pb-1">
                {{ $t('campaign.estRewards') }}
              </p>
              <div class="flex items-center justify-between max-w-[200px]">
                <p class="text-sm">
                  {{ estRewardsInINJToString }} INJ,
                  {{ estRewardsInTIAToString }} TIA
                </p>
                <!-- <AppButton v-if="isClaimable" class="border border-blue-500" xs>
                  <span class="text-blue-500 font-semibold">
                    {{ $t('campaign.claim') }}
                  </span>
                </AppButton> -->
              </div>
            </div>
          </div>
        </div>
      </template>
    </AppHocLoading>
  </div>
</template>
