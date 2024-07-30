<script lang="ts" setup>
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  account: {
    type: String,
    default: ''
  },

  volume: {
    type: Number,
    default: 0
  },

  rank: {
    type: Number,
    default: 0
  }
})

const formattedAddress = computed(() => formatWalletAddress(props.account))

const { valueToString: volumeToFormat } = useSharedBigNumberFormatter(
  computed(() => props.volume),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const entries = computed(() => {
  return new BigNumberInBase(props.volume)
    .dividedBy(100)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
})
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
        <span class="md:hidden text-xs lowercase">
          {{ formattedAddress }}
        </span>
        <span
          class="hidden md:block"
          :class="[
            rank > 3 ? 'text-xs lg:text-sm' : 'text-xs lg:text-sm 2xl:text-base'
          ]"
        >
          {{ account }}
        </span>
      </span>
    </template>

    <template #column3>
      <span class="text-[13px] md:text-sm">
        {{ `$${volumeToFormat}` }}
      </span>
    </template>

    <template #column4>
      <span class="text-[13px] md:text-sm mr-2">
        {{ entries }}
      </span>
    </template>
  </PartialsLeaderboardVolumeCommonRowWrapper>
</template>
