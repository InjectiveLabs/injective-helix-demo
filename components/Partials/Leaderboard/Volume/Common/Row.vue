<script lang="ts" setup>
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()

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

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const entries = computed(() =>
  new BigNumberInBase(props.amount)
    .dividedBy(100)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
)
</script>

<template>
  <PartialsLeaderboardVolumeCommonRowWrapper>
    <template #column1>
      <span class="font-semibold ml-1">
        {{ rank }}
      </span>
    </template>

    <template #column2>
      <span class="font-medium">
        <div class="md:hidden flex items-center text-xs lowercase space-x-2">
          <div>
            {{ formattedAddress }}
          </div>
          <div v-if="rank === 1">
            {{ $t('leaderboard.volume.currentLeaderMobile') }}
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
              {{ $t('leaderboard.volume.currentLeader') }}
            </div>
            <div class="2xl:hidden">
              {{ $t('leaderboard.volume.currentLeaderMobile') }}
            </div>
          </div>
        </div>
      </span>
    </template>

    <template #column3>
      <span class="text-[13px] md:text-sm mr-2">
        <span v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl">
          {{ `${amountToBigNumber.gte(0) ? '+' : '-'}` }}
        </span>
        <span v-else>$</span>
        <span>
          {{ amountToFormat }}
        </span>
      </span>
    </template>

    <template #column4>
      <span class="text-[13px] md:text-sm mr-2">
        {{ entries }}
      </span>
    </template>
  </PartialsLeaderboardVolumeCommonRowWrapper>
</template>
