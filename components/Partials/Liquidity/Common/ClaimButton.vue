<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

const props = defineProps({
  forceDisabled: Boolean,

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  }
})

const campaignStore = useCampaignStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

function claimRewards() {
  if (props.campaign.userClaimed || !props.campaign.isClaimable) {
    return
  }

  status.setLoading()

  const campaignId =
    Number(props.campaign.version) === 1 ? undefined : props.campaign.campaignId

  campaignStore
    .claimReward(props.campaign.rewardContract, campaignId)
    .then(() => {
      notificationStore.success({
        title: t('campaign.success'),
        description: t('campaign.successfullyClaimedRewards')
      })

      backupPromiseCall(() => campaignStore.fetchRound())
    })
    .catch((er) => {
      if ((er.originalMessage as string).includes('has already claimed')) {
        notificationStore.error({
          title: t('campaign.error'),
          description: t('campaign.errorAlreadyClaimed')
        })
      } else {
        $onError(er)
      }
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppButton
    v-bind="{ status }"
    :class="{
      'bg-blue-500 border-blue-500 border':
        !campaign.userClaimed && campaign.isClaimable
    }"
    :disabled="campaign.userClaimed || !campaign.isClaimable || forceDisabled"
    @click="claimRewards"
  >
    <span v-if="campaign.userClaimed">{{ $t('campaign.claimed') }}</span>
    <span v-else>{{ $t('campaign.claim') }}</span>
  </AppButton>
</template>
