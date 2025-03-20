<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { PAST_LEADERBOARD_CAMPAIGN_NAMES } from '@/app/data/campaign'

const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const selectedCampaignName = ref('')
const status = reactive(new Status(StatusType.Loading))

const options = computed(() => {
  if (!campaignStore.pastPnlOrVolumeCampaigns) {
    return
  }

  return campaignStore.pastPnlOrVolumeCampaigns.map(({ name }) => ({
    label: name,
    id: name
  }))
})

const selectedCampaign = computed(() => {
  if (!campaignStore.pastPnlOrVolumeCampaigns) {
    return
  }

  return campaignStore.pastPnlOrVolumeCampaigns.find(
    ({ name }) => name === selectedCampaignName.value
  )
})

onMounted(() => {
  fetchPastCampaigns()
})

function fetchPastCampaigns() {
  campaignStore
    .fetchPastCampaigns()
    .then(() => {
      if (!campaignStore.pastPnlOrVolumeCampaigns) {
        return
      }

      const [lastCampaign] = campaignStore.pastPnlOrVolumeCampaigns

      selectedCampaignName.value = lastCampaign.name
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div :key="selectedCampaignName">
    <AppHocLoading v-bind="{ isLoading: status.isLoading() }">
      <div class="overflow-x-auto">
        <Teleport
          v-if="
            campaignStore.pastPnlOrVolumeCampaigns &&
            PAST_LEADERBOARD_CAMPAIGN_NAMES.length > 1
          "
          to="#leaderboard-target"
          defer
        >
          <USelectMenu
            v-model="selectedCampaignName"
            :options="options"
            value-attribute="id"
          />
        </Teleport>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetitionPastBanner
            v-if="selectedCampaign"
            v-bind="{ selectedCampaign }"
          />

          <PartialsLeaderboardCompetition
            v-if="selectedCampaign"
            v-bind="{ campaign: selectedCampaign }"
          />

          <div v-else class="w-full text-sm relative mb-20">
            <div class="text-2xl sm:text-3xl font-bold tracking-[0.4px] mb-2">
              {{ $t('leaderboard.competition.noPastCompetition') }}
            </div>
          </div>
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
