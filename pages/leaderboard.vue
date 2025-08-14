<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { isCountryRestrictedForLeaderboard } from '@/app/data/geoip'
import { UPCOMING_LEADERBOARD_CAMPAIGN_NAME } from '@/app/data/campaign'
import { MainPage, LeaderBoardCyTags, LeaderboardSubPage } from '@/types'

const route = useRoute()
const campaignStore = useCampaignStore()
const sharedGeoStore = useSharedGeoStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const hasUpcomingCampaign = computed(() => {
  if (!campaignStore.pnlOrVolumeCampaigns) {
    return
  }

  return campaignStore.pnlOrVolumeCampaigns.some(
    ({ name }) => name === UPCOMING_LEADERBOARD_CAMPAIGN_NAME
  )
})

const isCampaignTabDisabled = computed(
  () => !campaignStore.activeCampaign && !hasUpcomingCampaign.value
)

const leaderboardSubpages = computed(() =>
  Object.values(LeaderboardSubPage).map((pageName) => ({
    pageName,
    isDisabled:
      pageName === LeaderboardSubPage.Competition && isCampaignTabDisabled.value
  }))
)

const isBlockedBannerVisible = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  return (
    route.name === LeaderboardSubPage.Competition &&
    isCountryRestrictedForLeaderboard(sharedGeoStore.country)
  )
})

onMounted(fetchCampaigns)

function fetchCampaigns() {
  status.setLoading()

  Promise.all([
    campaignStore.fetchActiveCampaign(),
    campaignStore.fetchUpcomingCampaigns()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="relative">
    <i18n-t
      v-if="isBlockedBannerVisible"
      keypath="leaderboard.blocked"
      tag="p"
      class="text-xs md:text-sm font-medium leading-3 md:leading-[18px] text-center py-1.5 px-4 md:px-10 bg-[#FFA36E] text-coolGray-925 relative z-40"
    >
      <template #terms>
        <NuxtLink
          :to="{ name: MainPage.LikeAGCompetitionTerms }"
          class="text-[#FFFDD0] hover:opacity-80"
        >
          {{ $t('leaderboard.rulesTermsAndConditions') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <div
      class="bg-[url('/images/leaderboard/pnl-bg.webp')] h-[1155px] w-full bg-center bg-contain -top-[100px] opacity-70 absolute"
    />

    <div
      class="container lg:px-[120px] max-lg:px-4 mx-auto text-center relative"
    >
      <AppHocLoading v-bind="{ status, isFullScreen: true }">
        <section class="flex flex-col space-y-2 pt-12 pb-7 md:py-40">
          <div
            class="uppercase font-rubik font-black text-3xl md:text-6xl"
            :data-cy="dataCyTag(LeaderBoardCyTags.title)"
          >
            {{ $t('leaderboard.title') }}
          </div>
          <div class="max-sm:text-xs">
            {{ $t('leaderboard.description') }}
          </div>
        </section>

        <section class="h-full-flex">
          <div
            class="flex flex-col md:flex-row flex-wrap gap-3 max-md:space-y-4 justify-between mb-6 md:mb-10"
          >
            <div
              class="max-md:flex max-md:gap-4 max-md:flex-wrap overflow-x-auto max-sm:max-w-full"
            >
              <NuxtLink
                v-for="page in leaderboardSubpages"
                :key="page.pageName"
                :to="page.isDisabled ? '' : { name: page.pageName }"
                class="capitalize md:px-4 text-sm md:text-lg font-semibold whitespace-nowrap leading-6"
                :class="{
                  'hidden': page.isDisabled,
                  'text-coolGray-200': route.name !== page.pageName
                }"
              >
                <span
                  class="pb-2"
                  :class="{
                    'border-b-4 border-blue-500 text-blue-500 inline-block':
                      route.name === page.pageName
                  }"
                  :data-cy="dataCyTag(LeaderBoardCyTags.pageName)"
                >
                  {{ $t(`leaderboard.tabs.${page.pageName}`) }}
                </span>
              </NuxtLink>
            </div>

            <div id="leaderboard-target" />
          </div>

          <NuxtPage
            :transition="{
              name: 'fade',
              mode: 'out-in'
            }"
            @campaigns:fetch="fetchCampaigns"
          />
        </section>
      </AppHocLoading>
    </div>
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
  &.is-campaign-with-entries {
    > :nth-child(3) {
      @apply text-left col-span-2 mr-0.5 ml-0;
    }

    > :nth-child(4) {
      @apply text-right md:text-left col-span-1 mr-0.5;
    }
  }

  &:not(.is-campaign-with-entries) {
    > :nth-child(3) {
      @apply text-left col-span-2 mr-0.5 ml-40 2xl:ml-[16rem];
    }

    > :nth-child(4) {
      @apply hidden;
    }
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
