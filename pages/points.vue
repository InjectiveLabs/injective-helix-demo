<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { PointsPeriod } from '@/types'

definePageMeta({
  middleware: ['connected']
})

const { $onError } = useNuxtApp()
const pointsStore = usePointsStore()

const pointsPeriodList = [PointsPeriod.Day, PointsPeriod.Week]

const selectedPeriod = ref(pointsPeriodList[0])
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))

const isDailyPeriod = computed(() => selectedPeriod.value === PointsPeriod.Day)

function fetchAccountPoints() {
  fetchStatus.setLoading()

  const action = isDailyPeriod.value
    ? pointsStore.fetchAccountDailyPoints
    : pointsStore.fetchAccountWeeklyPoints

  action()
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
}

onWalletConnected(() => {
  Promise.all([
    pointsStore.fetchPoints(),
    pointsStore.fetchAccountDailyPoints()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(
  () =>
    Promise.all([
      pointsStore.fetchPoints(),
      isDailyPeriod.value
        ? pointsStore.fetchAccountDailyPoints()
        : pointsStore.fetchAccountWeeklyPoints()
    ]),
  60 * 1000
)
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div
      class="pt-16 pb-32 px-48 max-xs:pt-8 max-xs:px-4 max-xs:pb-16 max-xl:pt-12 max-xl:px-12 max-xl:pb-24 max-3xl:px-40 max-w-[1400px] 5xl:max-w-[90%]"
    >
      <div class="flex flex-col gap-4 max-xs:gap-1">
        <h1 class="text-3xl max-xs:text-2xl">{{ $t('points.title') }}</h1>
        <p class="text-base tracking-wide max-xs:text-sm">
          {{ $t('points.description') }}
        </p>
      </div>

      <PartialsPointsStats />

      <div class="flex gap-6 max-lg:flex-col max-lg:items-center">
        <AppHocLoading
          v-bind="{ status: fetchStatus }"
          wrapper-class="self-center flex-1"
        >
          <PartialsPointsTable
            v-model="selectedPeriod"
            :points-period-list="pointsPeriodList"
            @update:model-value="fetchAccountPoints"
          />
        </AppHocLoading>
        <PartialsPointsScoreCard />
      </div>
    </div>
  </AppHocLoading>
</template>
