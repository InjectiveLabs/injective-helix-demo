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
      notificationStore.update({
        title: t('toast.success'),
        description: t('toast.campaign.successfullyClaimedRewards')
      })

      sharedBackupPromiseCall(() => campaignStore.fetchRound())
    })
    .catch((er) => {
      if ((er.originalMessage as string).includes('has already claimed')) {
        notificationStore.error({
          title: t('toast.error'),
          description: t('toast.campaign.errorAlreadyClaimed')
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
    :text="t('lpRewards.rewardsPending')"
    :prevent="campaign.isClaimable || campaign.endDate > Date.now()"
  >
    <AppButton
      :class="extraClass"
      v-bind="{ status }"
      :disabled="forceDisabled || campaign.userClaimed || !campaign.isClaimable"
      @click="claimRewards"
    >
      <span v-if="campaign.userClaimed">{{ $t('common.claimed') }}</span>
      <span v-else>{{ $t('common.claim') }}</span>
    </AppButton>
  </UTooltip>
</template>
