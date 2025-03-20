<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import {
  FIRST_CAMPAIGN_NAME,
  THIRD_CAMPAIGN_NAME,
  SECOND_CAMPAIGN_NAME
} from '@/app/data/campaign'

withDefaults(
  defineProps<{
    selectedCampaign: CampaignV2
  }>(),
  {}
)
</script>

<template>
  <PartialsLeaderboardCompetitionGwagonBanner
    v-if="selectedCampaign.name === FIRST_CAMPAIGN_NAME"
    v-bind="{ campaign: selectedCampaign }"
  />

  <PartialsLeaderboardCompetitionTeslaBanner
    v-if="selectedCampaign.name === SECOND_CAMPAIGN_NAME"
    v-bind="{ campaign: selectedCampaign }"
  />

  <PartialsLeaderboardCompetitionOwnYourAssetBanner
    v-if="selectedCampaign.name === THIRD_CAMPAIGN_NAME"
    v-bind="{ campaign: selectedCampaign }"
  />
</template>
