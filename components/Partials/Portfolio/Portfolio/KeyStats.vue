<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { TokenSymbols } from '@/app/data/token'

const leaderboardStore = useLeaderboardStore()
const { t } = useLang()
const {
  aggregatedSubaccountTotalBalanceInUsd,
  aggregatedSubaccountUnrealizedPnlInUsd
} = useBalance()

const { valueToBigNumber: spotEquityInBigNumber } = useSharedBigNumberFormatter(
  computed(() =>
    aggregatedSubaccountTotalBalanceInUsd.value.minus(
      aggregatedSubaccountUnrealizedPnlInUsd.value
    )
  )
)

const keyStats = computed(() => {
  const allTimePnl = new BigNumberInBase(
    leaderboardStore.pnlLeaderboard?.accountRow?.pnl || 0
  )
  const pnlTextColor = allTimePnl.isZero()
    ? 'text-gray-200'
    : allTimePnl.gt(0)
      ? 'text-green-500'
      : 'text-red-500'

  return [
    {
      value: allTimePnl,
      textColor: pnlTextColor,
      title: t('portfolio.keyStats.allTimePnl')
    },
    {
      title: t('portfolio.keyStats.totalVolume'),
      value: new BigNumberInBase(
        leaderboardStore.pnlLeaderboard?.accountRow?.volume || 0
      )
    },
    {
      value: aggregatedSubaccountTotalBalanceInUsd.value,
      title: t('portfolio.keyStats.totalEquity')
    },
    {
      value: aggregatedSubaccountUnrealizedPnlInUsd.value,
      title: t('portfolio.keyStats.perpsAccountEquity')
    },
    {
      value: spotEquityInBigNumber.value,
      title: t('portfolio.keyStats.spotAccountEquity')
    },
    {
      text: TokenSymbols.INJ,
      title: t('portfolio.keyStats.stakingAccount')
    }
  ]
})
</script>

<template>
  <div class="border rounded-xl p-4">
    <h4 class="font-semibold text-coolGray-200 text-sm">
      {{ $t('portfolio.keyStats.title') }}
    </h4>

    <ul class="flex flex-col gap-6 mt-6">
      <li
        v-for="(stat, index) in keyStats"
        :key="index"
        class="flex justify-between gap-4 text-sm"
      >
        <span class="text-coolGray-375">{{ stat.title }}</span>

        <p
          v-if="stat.value"
          class="flex"
          :class="stat.textColor || 'text-gray-200'"
        >
          <span>$</span>
          <AppUsdAmount
            v-bind="{
              amount: stat.value.toFixed(),
              roundingMode: BigNumberInBase.ROUND_HALF_UP
            }"
          />
        </p>
        <span v-else class="text-gray-200">{{ stat.text }}</span>
      </li>
    </ul>
  </div>
</template>
