<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'
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

const { valueToString: volumeToFormat, valueToBigNumber: volumeToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.volume),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )
</script>

<template>
  <div class="grid grid-cols-[38px_1fr] ml-4 gap-7">
    <div class="h-full-flex items-start gap-y-1">
      <div class="text-[11px] leading-3 mb-1">
        {{ $t('leaderboard.header.rank') }}
      </div>
      <div class="text-sm font-semibold leading-4">{{ rank }}</div>
    </div>

    <div class="h-full-flex items-start gap-y-1">
      <div class="font-medium text-[11px] leading-3">
        {{ $t('leaderboard.header.address') }}
      </div>

      <div class="font-medium text-sm leading-5">{{ formattedAddress }}</div>

      <div class="flex justify-between mt-3">
        <div class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{ $t('leaderboard.header.volume') }}
          </div>
          <div class="font-medium text-sm">
            {{ `${volumeToBigNumber.gte(0) ? '+' : '-'}${volumeToFormat}` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
