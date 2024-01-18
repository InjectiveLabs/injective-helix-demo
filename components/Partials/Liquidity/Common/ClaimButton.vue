<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps({
  isClaimed: Boolean,
  isClaimable: Boolean,

  scAddress: {
    type: String,
    required: true
  },

  campaignId: {
    type: String,
    required: true
  }
})

const campaignStore = useCampaignStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

function claimRewards() {
  if (props.isClaimed || !props.isClaimable) {
    return
  }

  status.setLoading()

  campaignStore
    .claimReward(props.scAddress, Number(props.campaignId))
    .then(() => {
      success({
        title: t('campaign.success'),
        description: t('campaign.successfullyClaimedRewards')
      })

      campaignStore.fetchRound()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppButton
    v-bind="{ status }"
    :class="{
      'bg-blue-500 border-blue-500 border': !isClaimed && isClaimable
    }"
    :is-disabled="isClaimed || !isClaimable"
    @click="claimRewards"
  >
    <span v-if="isClaimed">{{ $t('campaign.claimed') }}</span>
    <span v-else>{{ $t('campaign.claim') }}</span>
  </AppButton>
</template>
