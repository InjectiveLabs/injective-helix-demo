<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { SharedDropdownOption } from '@shared/types'
import {
  FIRST_CAMPAIGN_NAME,
  PAST_LEADERBOARD_CAMPAIGN_NAMES
} from '@/app/data/campaign'

const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const selectedCampaignName = ref('')
const status = reactive(new Status(StatusType.Loading))

const options = computed<SharedDropdownOption[] | undefined>(() => {
  if (!campaignStore.pastPnlOrVolumeCampaigns) {
    return
  }

  return campaignStore.pastPnlOrVolumeCampaigns.map(({ name }) => ({
    display: name,
    value: name
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
          <AppSelect
            v-model="selectedCampaignName"
            v-bind="{
              options,
              wrapperClass:
                'py-2 px-3 rounded max-md:text-xs border border-gray-450 font-medium w-[350px] md:w-[400px]',
              contentClass:
                'max-h-[320px] overflow-y-auto  max-md:text-xs font-medium w-[350px] md:w-[400px]'
            }"
            start-placement
          >
            <template #default="{ selected }">
              <div
                class="flex items-center space-x-2 font-semibold tracking-wide w-full"
              >
                {{ selected?.display }}
              </div>
            </template>

            <template #option="{ option }">
              <div>{{ option?.display }}</div>
            </template>
          </AppSelect>
        </Teleport>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetitionBanner
            v-if="
              selectedCampaign && selectedCampaign.name === FIRST_CAMPAIGN_NAME
            "
            v-bind="{ campaign: selectedCampaign }"
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

<style>
.competition-table,
.competition-table-mobile {
  @apply grid grid-cols-6 md:grid-cols-9 relative;

  > :nth-child(1) {
    @apply pl-3 xl:pl-7 text-left col-span-1 flex items-center;
  }

  > :nth-child(2) {
    @apply text-left col-span-2 md:col-span-5 flex items-center;
  }
}

.competition-table {
  > :nth-child(3) {
    @apply text-left col-span-2 mr-0.5;
  }

  > :nth-child(4) {
    @apply text-right md:text-left col-span-1 mr-0.5;
  }
}

.competition-table-mobile {
  > :nth-child(3) {
    @apply flex flex-col col-span-3 items-end;
  }
}

.competition-gradient-text {
  background: linear-gradient(124deg, #fff 35.59%, #76838e 99.6%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
