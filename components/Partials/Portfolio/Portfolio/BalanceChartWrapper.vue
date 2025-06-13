<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { usdtToken } from '@shared/data/token'
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { HistoricalPortfolioDuration } from '@/types'

const appStore = useAppStore()
const accountStore = useAccountStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()
const {
  stakedAmountInUsd,
  aggregatedSubaccountTotalBalanceInUsd,
  aggregatedSubaccountUnrealizedPnlInUsd
} = useBalance()

const selectedDuration = ref(HistoricalPortfolioDuration.OneMonth)
const status = reactive(new Status(StatusType.Loading))

const isProfit = computed(() => percentageChange.value > 0)

const balanceSeries = computed(() => {
  const lastSeriesCount =
    selectedDuration.value === HistoricalPortfolioDuration.OneMonth ? 3 : 1

  return leaderboardStore.historicalBalance.map((item, index, array) =>
    index >= array.length - lastSeriesCount
      ? [item.time, aggregatedSubaccountTotalTradable.value.toNumber()]
      : [item.time, item.value]
  )
})

const percentageChange = computed(() => {
  const oldBalance = balanceSeries.value[0]

  if (!oldBalance) {
    return 0
  }

  return aggregatedSubaccountTotalTradable.value
    .minus(oldBalance[1])
    .dividedBy(oldBalance[1])
    .times(100)
    .toNumber()
})

const { valueToBigNumber: neptuneBalanceInBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      sharedToBalanceInToken({
        decimalPlaces: usdtToken.decimals,
        value: accountStore.neptuneUsdtInBankBalance,
        fixedDecimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
      })
    )
  )

const { valueToBigNumber: aggregatedSubaccountTotalTradable } =
  useSharedBigNumberFormatter(
    computed(() =>
      aggregatedSubaccountTotalBalanceInUsd.value
        .minus(stakedAmountInUsd.value)
        .minus(neptuneBalanceInBigNumber.value)
        .minus(aggregatedSubaccountUnrealizedPnlInUsd.value)
    )
  )

onMounted(() => fetchBalance())

function fetchBalance() {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalBalance(selectedDuration.value)
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="p-6">
    <div
      class="h-40 xs:h-28 gap-2 flex justify-between items-start max-xs:flex-col"
    >
      <div>
        <p class="text-coolGray-400">
          {{ $t(`portfolio.home.tradableBalance.title`) }}
        </p>

        <div class="flex flex-col">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1 items-center">
              <span class="text-2xl">$</span>
              <CommonSkeletonSubaccountAmount>
                <CommonNumberCounter
                  v-bind="{
                    size: 24,
                    value: aggregatedSubaccountTotalTradable.toNumber() || 0
                  }"
                />
              </CommonSkeletonSubaccountAmount>
            </div>

            <button
              class="text-coolGray-500 flex justify-center cursor-pointer"
              @click="appStore.toggleHideBalances"
            >
              <UIcon
                v-if="appStore.userState.preferences.isHideBalances"
                :name="NuxtUiIcons.EyeSlash"
                class="size-7 -translate-x-[2px]"
              />
              <UIcon v-else :name="NuxtUiIcons.Eye" class="size-7" />
            </button>
          </div>

          <PartialsPortfolioPortfolioValue
            v-bind="{
              stakedAmountInUsd,
              neptuneBalanceInBigNumber,
              aggregatedSubaccountTotalTradable,
              aggregatedSubaccountTotalBalanceInUsd,
              aggregatedSubaccountUnrealizedPnlInUsd
            }"
          />

          <p
            :class="{
              'text-red-500': !isProfit,
              'text-green-500': isProfit
            }"
          >
            <span class="text-sm flex items-center space-x-1">
              <CommonNumberCounter
                v-bind="{ value: percentageChange, decimals: 2, size: 15 }"
              />
              <span class="text-sm">%</span>
            </span>
          </p>
        </div>
      </div>

      <div class="bg-coolGray-800 rounded flex p-1">
        <AppButtonSelect
          v-for="value in Object.values(HistoricalPortfolioDuration)"
          :key="value"
          v-model="selectedDuration"
          v-bind="{ value }"
          active-classes="bg-coolGray-875 !opacity-100"
          class="text-sm py-1 px-3 text-white hover:opacity-50 cursor-pointer rounded transition-opacity"
          @update:model-value="fetchBalance"
        >
          {{ $t(`portfolio.duration.${value}`) }}
        </AppButtonSelect>
      </div>
    </div>

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />

    <PartialsPortfolioPortfolioAreaChart
      v-else
      v-bind="{
        isProfit,
        series: balanceSeries,
        label: 'common.value'
      }"
    />
  </div>
</template>
