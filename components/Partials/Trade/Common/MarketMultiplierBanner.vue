<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { format, parseISO, isWithinInterval } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { MainPage, UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const marketIdToMultiplierMap = {
  '0x7ea186f21902ec6fa42ff39c66a56e72796173d34718cab3580e08c72c8d2c78': {
    multiplier: '5',
    startDate: '2024-10-02T00:00:00Z',
    endDate: '2024-10-03T00:00:00Z'
  }, // 2024ELECTIOIN PERP market
  '0xa9ff3263c6a23bd1effb92f663bd8a1c9f9fa25f83f02c45364f92d77473827b': {
    multiplier: '5',
    startDate: '2024-10-03T16:00:00Z',
    endDate: '2024-10-04T16:00:00Z'
  }, // MOTHER/USDT PERP market,
  '0x4ca0f92fc28be0c9761326016b5a1a2177dd6375558365116b5bdda9abc229ce': {
    multiplier: '5',
    startDate: '2024-10-09T14:00:00Z',
    endDate: '2024-10-10T14:00:00Z'
  }, // BTC/USDT PERP market
  '0x54d4505adef6a5cef26bc403a33d595620ded4e15b9e2bc3dd489b714813366a': {
    multiplier: '5',
    startDate: '2024-10-11T14:00:00Z',
    endDate: '2024-10-12T14:00:00Z'
  } // ETH/USDT PERP market
} as Record<string, Record<string, string>>

const now = useNow({ interval: 1000 })

const marketStats = computed(
  () => marketIdToMultiplierMap[props.market.marketId]
)

const isMarketMultiplierActive = computed(() => {
  if (!marketStats.value) {
    return
  }

  const startDateInUnixUTC = parseISO(marketStats.value.startDate).getTime()
  const endDateInUnixUTC = parseISO(marketStats.value.endDate).getTime()

  return isWithinInterval(now.value, {
    start: startDateInUnixUTC,
    end: endDateInUnixUTC
  })
})

const formattedStartDate = computed(() => {
  if (!marketStats.value) {
    return
  }

  const startDateInUTC = utcToZonedTime(marketStats.value.startDate, 'UTC')
  const formattedDate = format(startDateInUTC, "MMMM do 'at' HH:mm 'UTC'")

  return formattedDate
})

const formattedDuration = computed(() => {
  if (!marketStats.value) {
    return
  }

  const startDate = new Date(marketStats.value.startDate).getTime()
  const endDate = new Date(marketStats.value.endDate).getTime()

  const MILLISECONDS_TO_SECONDS = 1000
  const SECONDS_TO_MINUTES = 60
  const MINUTES_TO_HOURS = 60

  const durationInMilliseconds = new BigNumberInBase(endDate).minus(startDate)
  const durationInHours = durationInMilliseconds
    .dividedBy(MILLISECONDS_TO_SECONDS)
    .dividedBy(SECONDS_TO_MINUTES)
    .dividedBy(MINUTES_TO_HOURS)

  return durationInHours
})
</script>

<template>
  <i18n-t
    v-if="isMarketMultiplierActive"
    keypath="trade.marketMultiplierBanner.description"
    tag="p"
    class="text-xs md:text-sm font-medium leading-3 md:leading-[18px] text-center py-1.5 px-4 md:px-10 bg-[#FFA36E] text-gray-925 relative z-40"
  >
    <template #multiplier>{{ marketStats.multiplier }} </template>
    <template #startDate>{{ formattedStartDate }} </template>
    <template #duration>{{ formattedDuration }} </template>
    <template #terms>
      <NuxtLink
        :to="{ name: MainPage.LikeAGCompetitionTerms }"
        class="text-[#FFFDD0] hover:opacity-80"
      >
        {{ $t('leaderboard.rulesTermsAndConditions') }}
      </NuxtLink>
    </template>
  </i18n-t>
</template>
