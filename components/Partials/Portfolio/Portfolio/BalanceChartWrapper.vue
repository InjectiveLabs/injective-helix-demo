<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { NEPTUNE_USDT_BUFFER } from '@/app/utils/constants'
import { HistoricalPortfolioDuration } from '@/types'

const isMobile = useIsMobile()
const appStore = useAppStore()
const accountStore = useAccountStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()
const {
  stakedAmountInUsd,
  aggregatedSubaccountUnrealizedPnl,
  aggregatedSubaccountTotalBalanceInUsd
} = useBalance()

const selectedDuration = ref(HistoricalPortfolioDuration.OneDay)
const status = reactive(new Status(StatusType.Loading))

const isProfit = computed(() => percentageChange.value > 0)

const balanceSeries = computed(() =>
  leaderboardStore.historicalBalance.map((item, index, array) =>
    index === array.length - 1
      ? [item.time, aggregatedSubaccountTotalTradeable.value.toNumber()]
      : [item.time, item.value]
  )
)

const percentageChange = computed(() => {
  const oldBalance = balanceSeries.value[0]

  if (!oldBalance) {
    return 0
  }

  return aggregatedSubaccountTotalTradeable.value
    .minus(oldBalance[1])
    .dividedBy(oldBalance[1])
    .times(100)
    .toNumber()
})

const neptuneBankBalance = computed(() =>
  new BigNumberInBase(accountStore.neptuneUsdtInBankBalance).times(
    1 - NEPTUNE_USDT_BUFFER
  )
)

const { valueToBigNumber: aggregatedSubaccountTotalTradeable } =
  useSharedBigNumberFormatter(
    computed(() =>
      aggregatedSubaccountTotalBalanceInUsd.value
        .minus(stakedAmountInUsd.value)
        .minus(neptuneBankBalance.value)
        .minus(aggregatedSubaccountUnrealizedPnl.value)
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
  <div class="border p-4">
    <div class="gap-2 flex justify-between items-start max-xs:flex-col">
      <div>
        <p class="text-coolGray-400">
          {{ $t(`portfolio.home.tradeableBalance.title`) }}
        </p>

        <div class="h-20 lg:h-[88px] flex flex-col">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1 items-center">
              <span class="lg:text-2xl">$</span>
              <CommonSkeletonSubaccountAmount>
                <CommonNumberCounter
                  v-bind="{
                    value: aggregatedSubaccountTotalTradeable.toNumber() || 0
                  }"
                  :size="isMobile ? 16 : 24"
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
                class="w-5 h-5 lg:w-7 lg:h-7 -translate-x-[2px]"
              />
              <UIcon
                v-else
                :name="NuxtUiIcons.Eye"
                class="w-5 h-5 lg:w-7 lg:h-7"
              />
            </button>
          </div>

          <PartialsPortfolioPortfolioValue
            v-bind="{
              stakedAmountInUsd,
              neptuneBankBalance,
              aggregatedSubaccountTotalTradeable,
              aggregatedSubaccountTotalBalanceInUsd,
              aggregatedSubaccountUnrealizedPnl
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

      <div class="bg-brand-800 rounded flex p-1">
        <AppButtonSelect
          v-for="value in Object.values(HistoricalPortfolioDuration)"
          :key="value"
          v-model="selectedDuration"
          v-bind="{ value }"
          class="text-xs md:text-sm py-1 px-2 text-white hover:opacity-50 cursor-pointer rounded transition-opacity"
          active-classes="bg-brand-900 !opacity-100"
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
