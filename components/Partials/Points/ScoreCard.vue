<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
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

const canvas = ref()

const league = computed(
  () =>
    (pointsStore?.accountPoints?.league as PointsLeague) || PointsLeague.White
)

const leagueBg = computed(() => leagueBgList[league.value])
const beltImage = computed(() => beltImageList[league.value])

const { valueToString: totalPointsToString } = useSharedBigNumberFormatter(
  computed(() => pointsStore.accountPoints?.totalPoints || '0'),
  {
    shouldTruncate: true
  }
)

const { valueToString: rankToString } = useSharedBigNumberFormatter(
  computed(() => pointsStore.accountPoints?.rank || '0'),
  {
    shouldTruncate: true
  }
)

async function downloadImage() {
  await nextTick()

  toJpeg(canvas.value).then((dataUrl) => {
    const link = document.createElement('a')
    link.download = `Helix-Points-${now.value}.jpeg`
    link.href = dataUrl
    link.click()
  })
}
</script>

<template>
  <div
    class="flex flex-col justify-between w-[420px] h-[394px] max-xs:w-full rounded-lg overflow-hidden bg-black text-white'"
  >
    <div
      ref="canvas"
      class="flex flex-col flex-1 items-center px-[88px] max-xs:px-8 pt-4 bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url('/images/points/${leagueBg}.png')`
      }"
    >
      <AssetLogo class="w-auto h-9" alt="Helix" />

      <p class="text-xl max-xs:text-xl mt-12">
        {{ $t('points.myTotalPoints') }}
      </p>
      <p class="text-5xl font-medium max-xs:text-5xl mt-2 mb-6">
        {{ totalPointsToString }}
      </p>

      <div class="flex justify-between w-full">
        <div class="flex items-center gap-3">
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

        <div class="text-right">
          <p>
            {{ $t('points.rank') }}
          </p>

          <p class="font-bold">
            {{ rankToString }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-[#262A30] flex justify-end p-4">
      <AppButton
        class="bottom-4 right-4 flex justify-center items-center gap-2 py-2.5 px-8 rounded-lg text-black hover:bg-blue-600 hover:border-blue-600 focus-within:ring-0"
        @click="downloadImage"
      >
        <p class="text-xs font-normal leading-relaxed">
          {{ $t('points.share') }}
        </p>
        <UIcon :name="NuxtUiIcons.Download2" class="size-4" />
      </AppButton>
    </div>
  </div>
</template>
