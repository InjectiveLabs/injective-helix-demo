<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  fetchCompetitionLeaderboardAccount()
})

function fetchCompetitionLeaderboardAccount() {
  if (
    !campaignStore.activeCampaign ||
    !campaignStore.activeCampaignType ||
    !sharedWalletStore.injectiveAddress
  ) {
    return
  }

  status.setLoading()

  leaderboardStore
    .fetchCompetitionLeaderboardAccount({
      type: campaignStore.activeCampaignType,
      account: sharedWalletStore.injectiveAddress,
      duration: {
        startDate: campaignStore.activeCampaign.startDate,
        endDate: campaignStore.activeCampaign.endDate
      }
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <AppHocLoading
    v-if="
      sharedWalletStore.isUserConnected &&
      leaderboardStore.competitionLeaderboardAccount
    "
    v-bind="{ status }"
  >
    <PartialsLeaderboardMyStats>
      <template #add-on>
        <div
          class="hidden md:flex bg-green-450 items-center gap-1 px-2 py-1 rounded-[4px] cursor-pointer relative"
        >
          <p
            class="text-xs md:text-sm font-semibold leading-4 text-gray-925 uppercase"
          >
            {{ $t('leaderboard.competition.keepGoing') }}
          </p>
        </div>
      </template>

      <template #row>
        <div>
          <div class="hidden lg:block">
            <div>
              <PartialsLeaderboardCompetitionCommonHeader class="text-[11px]" />

              <PartialsLeaderboardCompetitionCommonRow
                class="text-sm my-1 items-center text-white"
                v-bind="{
                  leader: leaderboardStore.competitionLeaderboardAccount
                }"
              />
            </div>
          </div>

          <div class="lg:hidden">
            <PartialsLeaderboardCompetitionMyStatsMobileRow
              v-bind="{
                leader: leaderboardStore.competitionLeaderboardAccount
              }"
            />
          </div>
        </div>
      </template>
    </PartialsLeaderboardMyStats>
  </AppHocLoading>
</template>
