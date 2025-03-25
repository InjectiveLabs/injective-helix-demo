<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'

const isMobile = useIsMobile()
const appStore = useAppStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()
const { stakedAmountInUsd, aggregatedSubaccountTotalBalanceInUsd } =
  useBalance()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalBalance()
    .catch($onError)
    .finally(() => status.setIdle())
})

const isProfit = computed(() => percentageChange.value > 0)

const balanceSeries = computed(() =>
  leaderboardStore.historicalBalance.map((item) => [item.time, item.value])
)

const { valueToBigNumber: aggregatedSubaccountTotalWithoutStaking } =
  useSharedBigNumberFormatter(
    computed(() =>
      aggregatedSubaccountTotalBalanceInUsd.value.minus(stakedAmountInUsd.value)
    )
  )

const percentageChange = computed(() => {
  const oldBalance = balanceSeries.value[0]

  if (!oldBalance) {
    return 0
  }

  return aggregatedSubaccountTotalWithoutStaking.value
    .minus(oldBalance[1])
    .dividedBy(oldBalance[1])
    .times(100)
    .toNumber()
})
</script>

<template>
  <div class="border p-4">
    <p class="text-coolGray-400">
      {{ $t(`portfolio.home.balance.title`) }}
    </p>

    <div class="h-14">
      <div class="flex space-x-2 items-center">
        <div class="flex items-center space-x-2">
          <div class="flex flex-col">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1 items-center">
                <span class="lg:text-2xl">$</span>
                <CommonSkeletonSubaccountAmount>
                  <CommonNumberCounter
                    v-bind="{
                      value:
                        aggregatedSubaccountTotalWithoutStaking.toNumber() || 0
                    }"
                    :size="isMobile ? 16 : 24"
                  />
                </CommonSkeletonSubaccountAmount>
              </div>

              <div class="h-1 w-1 rounded-full bg-coolGray-300" />

              <div class="space-x-1 flex items-center text-xs sm:text-sm">
                <UIcon
                  :name="NuxtUiIcons.PottedPlant"
                  class="max-sm:h-4 max-sm:w-4 h-5 w-5 hidden sm:block"
                />

                <div>{{ $t('account.staked') }}:</div>
                <div class="flex items-center">
                  <span>$</span>
                  <CommonSkeletonSubaccountAmount>
                    <AppUsdAmount
                      class="leading-5"
                      v-bind="{
                        amount: stakedAmountInUsd.toFixed()
                      }"
                    />
                  </CommonSkeletonSubaccountAmount>
                </div>
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
      </div>
    </div>

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />

    <PartialsPortfolioPortfolioAreaChart
      v-else
      v-bind="{
        series: balanceSeries,
        isProfit,
        label: 'common.value'
      }"
    />
  </div>
</template>
