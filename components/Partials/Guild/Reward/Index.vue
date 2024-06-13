<script lang="ts" setup>
import { differenceInSeconds } from 'date-fns'
import { Status, StatusType } from '@injectivelabs/utils'
import { formatSecondsToDisplay } from '@/app/utils/formatters'
import { GUILD_CAMPAIGN_END_DATE } from '@/app/utils/constants'

const confetti = useSharedConfetti()
const campaignStore = useCampaignStore()
const { baseToken, quoteToken } = useGuild()

const props = defineProps({
  isCampaignOver: Boolean,

  now: {
    type: Number,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const isReadyToClaim = computed(() => props.now > GUILD_CAMPAIGN_END_DATE)

const isTVLWinner = computed(() => campaignStore.guild?.rankByTvl === 1)
const isVolumeWinner = computed(() => campaignStore.guild?.rankByVolume === 1)

onWalletConnected(() => {
  if (props.isCampaignOver && (isTVLWinner.value || isVolumeWinner.value)) {
    confetti.showConfetti()
  }
})

const countdown = computed(() => {
  const diffInSeconds = differenceInSeconds(GUILD_CAMPAIGN_END_DATE, props.now)
  const duration = formatSecondsToDisplay({ value: diffInSeconds })

  if (!duration) {
    return
  }

  let stopFilteringOutZero = false

  return Object.entries(duration).reduce((display, [key, value]) => {
    if (value === 0 && !stopFilteringOutZero) {
      return display
    }

    stopFilteringOutZero = true

    if (value === 0) {
      return `${display}00${key.charAt(0)} `
    }

    return `${display}${value < 10 ? `0${value}` : `${value}`}${key.charAt(0)} `
  }, '')
})
</script>

<template>
  <AppHocLoading
    v-if="
      isCampaignOver &&
      campaignStore.userGuildInfo &&
      (isTVLWinner || isVolumeWinner)
    "
    v-bind="{ status }"
    class="mt-8"
  >
    <div class="rounded-md p-8">
      <div class="flex items-center justify-between flex-wrap mb-4">
        <h2 class="font-semibold">{{ $t('campaign.myRewards') }}</h2>

        <p
          v-if="!isReadyToClaim && countdown"
          class="text-gray-500 text-xs space-x-1"
        >
          <span>{{ $t('guild.readyIn') }}:</span>
          <span>{{ countdown }}</span>
        </p>
      </div>

      <div class="space-y-4">
        <PartialsGuildRewardClaim
          v-if="isVolumeWinner"
          v-bind="{
            now,
            isReadyToClaim,
            isVolume: true,
            decimals: quoteToken?.decimals || 6,
            score: campaignStore.userGuildInfo.volumeScore,
            percentage: campaignStore.userGuildInfo.volumeScorePercentage,
            rewards: campaignStore.userGuildInfo.volumeReward
          }"
        />

        <PartialsGuildRewardClaim
          v-if="isTVLWinner"
          class="mt-4"
          v-bind="{
            now,
            isReadyToClaim,
            decimals: baseToken?.decimals || 18,
            score: campaignStore.userGuildInfo.tvlScore,
            percentage: campaignStore.userGuildInfo.tvlScorePercentage,
            rewards: campaignStore.userGuildInfo.tvlReward
          }"
        />
      </div>
    </div>
  </AppHocLoading>
</template>
