<script lang="ts" setup>
import { Status, StatusType, toBigNumber } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { PointsPeriod } from '@/types'

const pointsStore = usePointsStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()

const isSeeMoreDescription = ref(false)
const selectedPeriod = ref(PointsPeriod.Day)
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))

const totalPoints = computed(() =>
  toBigNumber(pointsStore.accountPoints?.totalPoints || '0').toFixed(0)
)

const pointsSeason1 = computed(() =>
  toBigNumber(pointsStore.accountPoints?.pointsSeason1 || 0).toFixed(0)
)

const bonusPoints = computed(() =>
  toBigNumber(pointsStore.accountPoints?.pointsBonus || '0').toFixed(0)
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

function toggleIsSeeMoreDescription() {
  isSeeMoreDescription.value = !isSeeMoreDescription.value
}

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

      <i18n-t
        tag="p"
        keypath="points.description1"
        class="tracking-wide max-sm:text-sm"
      >
        <template #seeMore>
          <span
            v-if="!isSeeMoreDescription"
            class="text-azure-blue-350 hover:opacity-80 transition-opacity cursor-pointer"
            @click="toggleIsSeeMoreDescription"
          >
            {{ $t('points.seeMore') }}
          </span>
          <template v-else>
            {{ $t('points.description2') }}
          </template>
        </template>
      </i18n-t>
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
          <div class="flex gap-2 items-center max-sm:mb-2">
            <h6 class="text-coolGray-375 text-[22px] max-sm:text-lg">
              {{ $t('points.season1Points') }}
            </h6>
            <UPopover
              :popper="{ placement: 'top' }"
              :mode="lg ? 'hover' : 'click'"
            >
              <UIcon
                :name="NuxtUiIcons.Info2"
                class="size-5 text-coolGray-375"
              />
              <template #panel>
                <span
                  class="flex flex-col gap-2 text-xs py-1 px-2 rounded bg-[#2D3135] tracking-wide"
                >
                  {{ $t('points.seasonOneTooltipContent') }}
                </span>
              </template>
            </UPopover>
          </div>
          <p class="text-3xl max-sm:text-2xl">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: pointsSeason1,
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
                amount: bonusPoints,
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
