<script lang="ts" setup>
const appStore = useAppStore()
const isMobile = useIsMobile()

const props = defineProps({
  isShowPercentChange: Boolean,
  isShowDirectionality: Boolean,
  isHideBalanceVisible: Boolean,

  leaderboardHistory: {
    type: Array as PropType<
      {
        time: number
        value: number
      }[]
    >,
    required: true
  }
})

const { valueToBigNumber: historyToBigNumber } = useSharedBigNumberFormatter(
  computed(
    () => props.leaderboardHistory[props.leaderboardHistory.length - 1].value
  )
)

const { valueToBigNumber: percentageToBigNumber } = useSharedBigNumberFormatter(
  computed(() => {
    const lastValue =
      props.leaderboardHistory[props.leaderboardHistory.length - 1].value
    const firstValue = props.leaderboardHistory[0].value

    return (lastValue / firstValue) * 100
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
          'text-red-500': isShowDirectionality && false,
          'text-green-500': isShowDirectionality && true
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
          'text-red-500': true,
          'text-green-500': false
        }"
      >
        <span class="text-sm">
          {{ `${false ? '+' : '-'}${percentageToBigNumber.toNumber()}%` }}
        </span>
      </p>
    </div>
  </div>

  <PartialsPortfolioPortfolioRandomChart
    v-bind="{ data: leaderboardHistory }"
  />
</template>
