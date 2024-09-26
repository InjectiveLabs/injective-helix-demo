<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { MIN_LEADERBOARD_TRADING_AMOUNT } from '@/app/utils/constants'

const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const limit = ref(20)
const status = reactive(new Status(StatusType.Loading))

const filteredVolumeLeaderboard = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.leaders) {
    return []
  }

  return leaderboardStore.competitionLeaderboard.leaders.filter((leader) =>
    new BigNumberInBase(leader.pnl).gte(MIN_LEADERBOARD_TRADING_AMOUNT)
  )
})

const formattedVolumeLeaderboard = computed(() => {
  if (!filteredVolumeLeaderboard.value) {
    return []
  }

  return filteredVolumeLeaderboard.value.slice(0, limit.value)
})

onMounted(() => {
  fetchLeaderboard()
})

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}

function fetchLeaderboard() {
  if (!campaignStore.activeCampaign || !campaignStore.activeCampaignType) {
    return
  }

  leaderboardStore
    .fetchCompetitionLeaderboard({
      type: campaignStore.activeCampaignType,
      duration: {
        startDate: campaignStore.activeCampaign.startDate,
        endDate: campaignStore.activeCampaign.endDate
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="mb-20">
    <AppHocLoading v-bind="{ status }">
      <PartialsLeaderboardCompetitionCommonHeader
        class="text-gray-350 text-[11px]"
      />

      <div v-if="formattedVolumeLeaderboard.length > 0" class="relative">
        <PartialsLeaderboardCompetitionCommonRow
          v-for="leader in formattedVolumeLeaderboard"
          :key="leader.rank"
          v-bind="{
            leader
          }"
          class="text-sm my-1 items-center rounded-lg"
          :class="{
            'bg-gray-825 py-4 text-white': leader.rank > 1,
            'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1
          }"
        />

        <PartialsLeaderboardTableBottomGradient
          v-if="
            formattedVolumeLeaderboard.length !==
            filteredVolumeLeaderboard.length
          "
        />
      </div>

      <CommonEmptyList
        v-else
        v-bind="{
          message: $t('leaderboard.competition.noVolumeData')
        }"
      />

      <template v-if="formattedVolumeLeaderboard.length > 0">
        <PartialsLeaderboardViewMore
          v-if="
            formattedVolumeLeaderboard.length > 0 &&
            formattedVolumeLeaderboard.length !==
              filteredVolumeLeaderboard.length
          "
          @limit:increment="incrementLimit"
        />

        <div class="mx-auto mt-6 leading-5">
          <span>{{ $t('leaderboard.footer.onlyTop100') }}</span>
          <span v-if="!sharedWalletStore.isUserConnected">
            {{ $t('leaderboard.footer.onlyTop100Connect') }}
          </span>
        </div>
      </template>
    </AppHocLoading>
  </div>
</template>
