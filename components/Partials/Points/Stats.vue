<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { format } from 'date-fns'

const pointsStore = usePointsStore()

const lastUpdated = computed(() => {
  if (!pointsStore.accountPoints) {
    return
  }

  return format(
    new Date(pointsStore.accountPoints?.updatedAt),
    'MMM dd HH:mm:ss'
  )
})

const {
  valueToString: totalPointsToString,
  valueToBigNumber: totalPointsToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => pointsStore.accountPoints?.totalPoints || '0'),
  {
    shouldTruncate: true,
    roundingMode: BigNumberInBase.ROUND_DOWN
  }
)

const { valueToString: rankToString, valueToBigNumber: rankToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => pointsStore.accountPoints?.rank || '0'),
    {
      shouldTruncate: true,
      roundingMode: BigNumberInBase.ROUND_DOWN
    }
  )
</script>

<template>
  <section class="mt-[72px] mb-20 max-xs:mt-14 max-xs:mb-16">
    <div class="flex max-lg:flex-col max-lg:gap-6">
      <div class="flex flex-col gap-1">
        <h4
          class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
        >
          {{ $t('points.totalPoints') }}
        </h4>
        <p
          class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
        >
          <span v-if="totalPointsToBigNumber.isZero()">&mdash;</span>
          <span v-else>{{ totalPointsToString }}</span>
        </p>
      </div>

      <span class="w-[1px] bg-[#707883] ml-10 mr-6 max-lg:hidden" />

      <div class="flex flex-col gap-1">
        <h4
          class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
        >
          {{ $t('points.rank') }}
        </h4>
        <p
          class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
        >
          <span v-if="rankToBigNumber.isZero()"> &mdash; </span>
          <span v-else>
            {{ rankToString }}
          </span>
        </p>
      </div>

      <template v-if="pointsStore.accountPoints">
        <span class="w-[1px] bg-[#707883] ml-20 mr-6 max-lg:hidden" />

        <div class="flex flex-col gap-1">
          <h4
            class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
          >
            {{ $t('points.level') }}
          </h4>
          <p
            class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
          >
            {{ $t(`points.leagues.${pointsStore.accountPoints.league}`) }}
          </p>
        </div>
      </template>
    </div>
    <div v-if="lastUpdated" class="text-sm text-coolGray-500 mt-4">
      <span>{{ $t('points.lastUpdatedAt') }}</span>
      <span>{{ lastUpdated }}</span>
    </div>
  </section>
</template>
