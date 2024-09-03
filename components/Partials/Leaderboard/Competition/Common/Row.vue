<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'

const isMobile = useIsMobile()

const props = defineProps({
  account: {
    type: String,
    default: ''
  },

  amount: {
    type: Number,
    default: 0
  },

  rank: {
    type: Number,
    default: 0
  }
})

const formattedAddress = computed(() => formatWalletAddress(props.account))
</script>

<template>
  <div :class="[isMobile ? 'competition-table-mobile' : 'competition-table']">
    <div>
      <span class="font-semibold ml-1">
        {{ rank }}
      </span>
    </div>

    <div>
      <span class="font-medium">
        <div class="md:hidden flex items-center text-xs lowercase space-x-2">
          <div>
            {{ formattedAddress }}
          </div>
          <div v-if="rank === 1">
            {{ $t('leaderboard.competition.currentLeaderMobile') }}
          </div>
        </div>
        <div
          class="hidden md:flex justify-start items-center space-x-4"
          :class="[
            rank > 3 ? 'text-xs lg:text-sm' : 'text-xs lg:text-sm 2xl:text-base'
          ]"
        >
          <div>
            {{ account }}
          </div>
          <div v-if="rank === 1">
            <div
              class="text-sm hidden 2xl:inline-flex bg-[#F06703] text-white uppercase font-semibold py-1 px-2 leading-4 rounded-[4px] gap-1 items-center"
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
      <PartialsLeaderboardCompetitionAmountEntries v-bind="{ amount }" />
    </template>

    <template v-else>
      <div>
        <PartialsLeaderboardCompetitionAmountEntries
          class="text-[13px] md:text-sm mr-2"
          v-bind="{ amount }"
        />
      </div>
    </template>
  </div>
</template>
