<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

const pointsStore = usePointsStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

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
      pointsStore.fetchAccountDailyPoints()
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
        <PartialsPointsTable />
        <PartialsPointsScoreCard />
      </div>
    </div>
  </AppHocLoading>
</template>
