<script lang="ts" setup>
const props = defineProps({
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

const { valueToString } = useSharedBigNumberFormatter(
  computed(
    () => props.leaderboardHistory[props.leaderboardHistory.length - 1].value
  )
)

const { valueToString: percentageToString } = useSharedBigNumberFormatter(
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

    <h3 class="text-2xl font-semibold">${{ valueToString }}</h3>

    <p class="text-green-500">{{ percentageToString }}%</p>
  </div>

  <PartialsPortfolioPortfolioRandomChart
    v-bind="{ data: leaderboardHistory }"
  />
</template>
