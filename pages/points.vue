<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { PointsPeriod } from '@/types'

const { $onError } = useNuxtApp()
const pointsStore = usePointsStore()
const sharedWalletStore = useSharedWalletStore()

const selectedPeriod = ref(PointsPeriod.Day)
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))

const totalPoints = computed(
  () => pointsStore.accountPoints?.totalPoints || '0'
)

onWalletConnected(() => {
  status.setLoading()

  Promise.all([
    pointsStore.fetchAccountPointsStat(),
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
    pointsStore.fetchAccountPointsStat(),
    selectedPeriod.value === PointsPeriod.Day
      ? pointsStore.fetchAccountDailyPoints()
      : pointsStore.fetchAccountWeeklyPoints()
  ])
}, 60 * 1000)

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
</script>

<template>
  <div class="pt-12 pb-32 px-8 max-w-[1104px] mx-auto">
    <div>
      <h1 class="text-3xl text-white">
        {{ $t('points.title') }}
      </h1>
      <h6 class="text-2xl max-sm:text-xl my-2 text-white">
        {{ $t('points.subtitle') }}
      </h6>

      <p class="tracking-wide max-sm:text-sm mb-6">
        {{ $t('points.description1') }}
      </p>
      <p class="tracking-wide max-sm:text-sm mb-6">
        {{ $t('points.description2') }}
      </p>
      <p class="tracking-wide max-sm:text-sm">
        {{ $t('points.description3') }}
      </p>
    </div>

    <PartialsPointsStats v-bind="{ totalPoints }" />

    <div class="flex gap-8 max-lg:flex-col max-lg:items-center">
      <USkeleton
        v-if="fetchStatus.isLoading()"
        class="flex-1 w-full max-lg:basis-52"
      />
      <PartialsPointsTable
        v-else
        v-model="selectedPeriod"
        v-bind="{
          isDailyPeriod: selectedPeriod === PointsPeriod.Day
        }"
        @update:model-value="fetchAccountPoints"
      />

      <div class="w-96 max-lg:w-full flex flex-col gap-8">
        <div class="p-4 bg-brand-925 rounded-2xl">
          <h6 class="text-coolGray-375 text-[22px] max-sm:text-lg max-sm:mb-2">
            {{ $t('points.season1Points') }}
          </h6>
          <p class="text-3xl max-sm:text-2xl">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: totalPoints,
                showZeroAsEmDash: true,
                shouldAbbreviate: false
              }"
            />
          </p>
        </div>

        <div class="p-4 bg-brand-925 rounded-2xl">
          <h6 class="text-coolGray-375 text-[22px] max-sm:text-lg max-sm:mb-2">
            {{ $t('points.bonusPoints') }}
          </h6>
          <p class="text-3xl max-sm:text-2xl">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: totalPoints,
                showZeroAsEmDash: true,
                shouldAbbreviate: false
              }"
            />
          </p>
        </div>

        <PartialsPointsScoreCard />
      </div>
    </div>
  </div>
</template>
