<script lang="ts" setup>
import { PortfolioChartType } from '@/types'

const appStore = useAppStore()
const isMobile = useIsMobile()

const props = defineProps({
  isShowPercentChange: Boolean,
  isHideBalanceVisible: Boolean,

  chartType: {
    type: String as PropType<PortfolioChartType>,
    required: true
  },

  leaderboardHistory: {
    type: Array as PropType<
      {
        time: number
        value: number
      }[]
    >,
    default: () => []
  }
})

const isProfit = computed(() => {
  return props.chartType === PortfolioChartType.Pnl
    ? historyToBigNumber.value.gt(0)
    : percentageToBigNumber.value.gt(0)
})

const { valueToBigNumber: historyToBigNumber } = useSharedBigNumberFormatter(
  computed(
    () => props.leaderboardHistory[props.leaderboardHistory.length - 1]?.value
  )
)

const { valueToBigNumber: percentageToBigNumber } = useSharedBigNumberFormatter(
  computed(() => {
    const lastValue =
      props.leaderboardHistory[props.leaderboardHistory.length - 1]?.value
    const firstValue = props.leaderboardHistory[0]?.value

    return 100 - (firstValue / lastValue) * 100
  })
)
</script>

<template>
  <div class="space-y-2">
    <slot name="title" />

    <div>
      <div
        class="flex items-center space-x-2"
        :class="{
          'text-red-500': !isProfit && chartType === PortfolioChartType.Pnl,
          'text-green-500': isProfit && chartType === PortfolioChartType.Pnl
        }"
      >
        <span class="text-2xl font-semibold -mr-2">$</span>
        <CommonSkeletonSubaccountAmount>
          <CommonNumberCounter
            v-bind="{ value: historyToBigNumber.toNumber() }"
            :size="isMobile ? 16 : 24"
          />
        </CommonSkeletonSubaccountAmount>

        <button
          v-if="isHideBalanceVisible"
          class="text-gray-500 flex justify-center cursor-pointer"
          @click="appStore.toggleHideBalances"
        >
          <SharedIcon
            v-if="appStore.userState.preferences.isHideBalances"
            name="hide"
            class="w-5 h-3 lg:w-8 lg:h-5 -translate-x-[2px]"
          />

          <SharedIcon v-else name="show" class="w-5 lg:w-7" />
        </button>
      </div>
      <p
        v-if="isShowPercentChange"
        :class="{
          'text-red-500': !isProfit,
          'text-green-500': isProfit
        }"
      >
        <span class="text-sm">
          {{ `${percentageToBigNumber.toFixed(2)}%` }}
        </span>
      </p>
    </div>
  </div>

  <PartialsPortfolioPortfolioLineChart
    v-bind="{
      isPositive: isProfit,
      data: leaderboardHistory,
      label: $t(`portfolio.home.${chartType}.title`)
    }"
  />
</template>
