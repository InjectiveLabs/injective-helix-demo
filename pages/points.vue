<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { PointsPeriod } from '@/types'

const { $onError } = useNuxtApp()
const pointsStore = usePointsStore()
const sharedWalletStore = useSharedWalletStore()

const selectedPeriod = ref(PointsPeriod.Day)
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))

function fetchAccountPoints() {
  fetchStatus.setLoading()

  const action =
    selectedPeriod.value === PointsPeriod.Day
      ? pointsStore.fetchAccountDailyPoints
      : pointsStore.fetchAccountWeeklyPoints

  action()
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
}

onWalletConnected(() => {
  status.setLoading()

  Promise.all([
    pointsStore.fetchPoints(),
    pointsStore.fetchAccountDailyPoints()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(() => {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  return Promise.all([
    pointsStore.fetchPoints(),
    selectedPeriod.value === PointsPeriod.Day
      ? pointsStore.fetchAccountDailyPoints()
      : pointsStore.fetchAccountWeeklyPoints()
  ])
}, 60 * 1000)
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div
      class="pt-12 pb-32 px-40 max-xs:pt-8 max-xs:px-4 max-xs:pb-16 max-xl:pt-12 max-xl:px-12 max-xl:pb-24 max-3xl:px-40 max-w-[1400px] 5xl:max-w-[90%] mx-auto"
    >
      <div class="flex flex-col gap-4 max-xs:gap-1">
        <h1 class="text-3xl max-xs:text-2xl">{{ $t('points.title') }}</h1>
        <p class="text-base tracking-wide max-xs:text-sm">
          {{ $t('points.description') }}
          <NuxtLink
            to="https://docs.helixapp.com/advanced/points"
            target="_blank"
            class="text-blue-500 font-bold"
          >
            {{ $t('common.here') }}
          </NuxtLink>
          <span>.</span>
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
            v-bind="{
              isDailyPeriod: selectedPeriod === PointsPeriod.Day
            }"
            @update:model-value="fetchAccountPoints"
          />
        </AppHocLoading>
        <PartialsPointsScoreCard />
      </div>
    </div>
  </AppHocLoading>
</template>
