<script lang="ts" setup>
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'

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

const entries = computed(() =>
  new BigNumberInBase(props.amount)
    .dividedBy(100)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
)
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
              class="text-sm hidden 2xl:inline-block bg-[#F06703] text-white uppercase font-semibold py-1 px-2 leading-4 rounded-[4px]"
            >
              {{ $t('leaderboard.competition.currentLeader') }}
            </div>
            <div class="2xl:hidden">
              {{ $t('leaderboard.competition.currentLeaderMobile') }}
            </div>
          </div>
        </div>
      </span>
    </div>

    <template v-if="!isMobile">
      <PartialsLeaderboardCompetitionCommonAmount
        class="text-[13px] md:text-sm mr-2"
        v-bind="{ amount }"
      />

      <div>
        <span class="text-[13px] md:text-sm mr-2">
          {{ entries }}
        </span>
      </div>
    </template>

    <template v-else>
      <div>
        <PartialsLeaderboardCompetitionCommonAmount
          class="text-[13px] md:text-sm mr-2"
          v-bind="{ amount }"
        />
        <div class="text-[13px] md:text-sm mr-2">
          {{ entries }}
        </div>
      </div>
    </template>
  </div>
</template>
