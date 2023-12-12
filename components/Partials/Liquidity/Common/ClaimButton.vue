<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps({
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

const isClaimed = computed(() =>
  campaignStore.claimedRewards.includes(props.campaignId)
)

function claimRewards() {
  if (isClaimed.value || !props.isClaimable) {
    return
  }

  status.setLoading()

  campaignStore
    .claimReward(props.scAddress)
    .then(() => {
      success({
        title: t('campaign.success'),
        description: t('campaign.successfullyClaimedRewards')
      })

      campaignStore.$patch({
        claimedRewards: [...campaignStore.claimedRewards, props.campaignId]
      })
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
