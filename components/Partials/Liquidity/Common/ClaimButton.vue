<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { sharedBackupPromiseCall } from '@shared/utils/async'
import type { Campaign } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    campaign: Campaign
    extraClass?: string
    forceDisabled?: boolean
  }>(),
  {
    extraClass: '',
    forceDisabled: false
  }
)

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
        title: t('toast.success'),
        description: t('toast.campaign.successfullyClaimedRewards')
      })

      sharedBackupPromiseCall(() => campaignStore.fetchRound())
    })
    .catch((er) => {
      if ((er.originalMessage as string).includes('has already claimed')) {
        notificationStore.error({
          title: t('toast.error'),
          description: t('toast.errorAlreadyClaimed')
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
  <UTooltip
    :prevent="campaign.isClaimable || campaign.endDate > Date.now()"
    :text="t('campaign.rewardsPending')"
  >
    <AppButton
      :class="extraClass"
      v-bind="{ status }"
      :disabled="campaign.userClaimed || !campaign.isClaimable || forceDisabled"
      @click="claimRewards"
    >
      <span v-if="campaign.userClaimed">{{ $t('campaign.claimed') }}</span>
      <span v-else>{{ $t('campaign.claim') }}</span>
    </AppButton>
  </UTooltip>
</template>
