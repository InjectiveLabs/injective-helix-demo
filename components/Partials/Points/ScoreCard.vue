<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { PointsLeague } from '@/types'

const pointsStore = usePointsStore()
const now = useNow({ interval: 1000 })

const leagueBgList = {
  [PointsLeague.Blue]: 'blue-belt-bg',
  [PointsLeague.Black]: 'black-belt-bg',
  [PointsLeague.White]: 'white-belt-bg',
  [PointsLeague.Orange]: 'orange-belt-bg',
  [PointsLeague.Purple]: 'purple-belt-bg'
}

const beltImageList = {
  [PointsLeague.Blue]: 'blue-belt',
  [PointsLeague.Black]: 'black-belt',
  [PointsLeague.White]: 'white-belt',
  [PointsLeague.Orange]: 'orange-belt',
  [PointsLeague.Purple]: 'purple-belt'
}

const unionImageList = {
  [PointsLeague.Blue]: 'blue-union',
  [PointsLeague.Black]: 'black-union',
  [PointsLeague.White]: 'white-union',
  [PointsLeague.Orange]: 'orange-union',
  [PointsLeague.Purple]: 'purple-union'
}

const canvas = ref()
const status = reactive(new Status(StatusType.Idle))

const league = computed(
  () =>
    (pointsStore?.accountPoints?.league as PointsLeague) || PointsLeague.White
)

const leagueBg = computed(() => leagueBgList[league.value])
const beltImage = computed(() => beltImageList[league.value])
const unionImage = computed(() => unionImageList[league.value])

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

async function downloadImage() {
  await nextTick()
  status.setLoading()

  try {
    await toJpeg(canvas.value).then((dataUrl) => {
      const link = document.createElement('a')
      link.download = `Helix-Points-${now.value}.jpeg`
      link.href = dataUrl
      link.click()
    })
  } finally {
    status.setIdle()
  }
}
</script>

<template>
  <div
    class="flex flex-col justify-between w-[420px] h-[394px] max-xs:w-full rounded-lg overflow-hidden bg-black text-white relative"
  >
    <div
      ref="canvas"
      class="flex flex-col flex-1 items-center pt-24 bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url('/images/points/${leagueBg}.png')`
      }"
    >
      <AssetLogo class="w-auto h-10" alt="Helix" />

      <p class="text-xl mt-4">
        {{ $t('points.myTotalPoints') }}
      </p>
      <p class="text-5xl font-bold mt-2 mb-16">
        <span v-if="totalPointsToBigNumber.isZero()">&mdash;</span>
        <span v-else>{{ totalPointsToString }}</span>
      </p>

      <div class="relative flex justify-between w-full px-[88px] max-xs:px-8">
        <img
          :src="`/images/points/level/${unionImage}.png`"
          class="h-20 w-full absolute z-[1] top-[calc(50%-10px)] -translate-y-1/2 left-0"
        />

        <div class="relative z-[2] flex items-center gap-3">
          <img :src="`/images/points/level/${beltImage}.png`" class="w-10" />
          <div>
            <p>{{ $t('points.level') }}</p>
            <p class="text-sm font-bold">
              {{
                $t(
                  `points.leagues.${
                    pointsStore?.accountPoints?.league || PointsLeague.White
                  }`
                )
              }}
            </p>
          </div>
        </div>

        <div class="relative z-[2] text-right">
          <p>
            {{ $t('points.rank') }}
          </p>

          <p class="font-bold">
            <span v-if="rankToBigNumber.isZero()">&mdash;</span>
            <span v-else>{{ rankToString }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="absolute top-0 right-0 flex justify-end p-4">
      <AppButton
        variant="primary-outline"
        :class="[
          'bottom-4 right-4 flex justify-center items-center gap-2 w-[132px] h-[45px] rounded-lg text-white ',
          status.isLoading() ? '[&>span]:hidden' : ''
        ]"
        :is-loading="status.isLoading()"
        @click="downloadImage"
      >
        <p class="text-sm leading-relaxed font-medium">
          {{ $t('points.share') }}
        </p>
        <UIcon :name="NuxtUiIcons.Download2" class="size-5" />
      </AppButton>
    </div>
  </div>
</template>
