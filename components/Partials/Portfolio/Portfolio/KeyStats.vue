<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'

const appStore = useAppStore()
const accountStore = useAccountStore()
const { t } = useLang()
const {
  stakedAmountInUsd,
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
  const allTimePnl = new BigNumberInBase(accountStore.accountStats?.pnl || 0)
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
      value: new BigNumberInBase(accountStore.accountStats?.volume || 0)
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
      isStakingAmount: true,
      value: stakedAmountInUsd.value,
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
        class="flex justify-between gap-4 text-sm h-6"
      >
        <span class="text-coolGray-375">{{ stat.title }}</span>

        <p
          class="flex"
          :class="[
            appStore.userState.preferences.isHideBalances
              ? 'text-gray-200'
              : stat.textColor || 'text-gray-200'
          ]"
        >
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: stat.value.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>
    </ul>
  </div>
</template>
