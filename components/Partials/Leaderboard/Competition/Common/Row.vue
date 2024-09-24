<script lang="ts" setup>
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { formatWalletAddress } from '@injectivelabs/utils'

const isMobile = useIsMobile()

const props = withDefaults(
  defineProps<{
    leader: LeaderboardRow
  }>(),
  {
    leader: () => ({
      account: '',
      rank: 0,
      pnl: 0,
      volume: 0
    })
  }
)

const formattedAddress = computed(() =>
  formatWalletAddress(props.leader.account)
)
</script>

<template>
  <div :class="[isMobile ? 'competition-table-mobile' : 'competition-table']">
    <div class="font-semibold ml-1">
      {{ leader.rank }}
    </div>

    <div>
      <span class="font-light font-mono">
        <div class="md:hidden flex items-center text-xs lowercase space-x-2">
          <div>
            {{ formattedAddress }}
          </div>
          <div v-if="leader.rank === 1">
            {{ $t('leaderboard.competition.currentLeaderMobile') }}
          </div>
        </div>
        <div
          class="hidden md:flex justify-start items-center space-x-1 xl:space-x-4"
          :class="[
            leader.rank > 1
              ? 'text-xs lg:text-sm'
              : 'text-xs lg:text-sm 2xl:text-base'
          ]"
        >
          <div>
            {{ leader.account }}
          </div>
          <div v-if="leader.rank === 1">
            <div
              class="text-xs 3xl:text-sm hidden 2xl:inline-flex bg-[#F06703] text-white uppercase font-semibold py-1 px-1.5 leading-4 rounded-[4px] gap-0.5 items-center"
            >
              <div>
                {{ $t('leaderboard.competition.currentLeader') }}
              </div>
              <div class="-mt-[2px] text-sm">
                {{ $t('leaderboard.competition.currentLeaderFlame') }}
              </div>
            </div>
            <div class="2xl:hidden">
              {{ $t('leaderboard.competition.currentLeaderMobile') }}
            </div>
          </div>
        </div>
      </span>
    </div>

    <template v-if="!isMobile">
      <PartialsLeaderboardCompetitionAmountEntries
        v-bind="{ volume: leader.volume, pnl: leader.pnl }"
      />
    </template>

    <template v-else>
      <div>
        <PartialsLeaderboardCompetitionAmountEntries
          v-bind="{ volume: leader.volume, pnl: leader.pnl }"
        />
      </div>
    </template>
  </div>
</template>
