<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
import { PointsLeague } from '@/types'

const now = useNow({ interval: 1000 })

const pointsStore = usePointsStore()

// todo: update the asset for Purple & Black once Nelmer confirmed the BG asset
const leagueBgList = {
  [PointsLeague.White]: 'bg-1',
  [PointsLeague.Orange]: 'bg-2',
  [PointsLeague.Blue]: 'bg-3',
  [PointsLeague.Purple]: 'bg-1',
  [PointsLeague.Black]: 'bg-1'
}

const canvas = ref()
const isShowDownloadButton = ref(true)

const league = computed(() => PointsLeague.White)
const leagueBg = computed(() => leagueBgList[league.value])

const { valueToFixed: totalPointsToFixed } = useSharedBigNumberFormatter(
  computed(() => pointsStore.accountPoints?.totalPoints || '0'),
  {
    shouldTruncate: true
  }
)

const { valueToFixed: rankToFixed } = useSharedBigNumberFormatter(
  computed(() => pointsStore.accountPoints?.rank || '0'),
  {
    shouldTruncate: true
  }
)

async function downloadImage() {
  isShowDownloadButton.value = false

  await nextTick()

  toJpeg(canvas.value)
    .then((dataUrl) => {
      const link = document.createElement('a')
      link.download = `Helix-Points-${now.value}.jpeg`
      link.href = dataUrl
      link.click()
    })
    .finally(() => {
      isShowDownloadButton.value = true
    })
}
</script>

<template>
  <div
    ref="canvas"
    :class="[
      'relative flex flex-col items-center py-4 px-[88px] w-[420px] min-h-[365px] max-xs:w-full max-xs:px-8 bg-cover bg-center bg-no-repeat bg-black text-white',
      isShowDownloadButton ? 'rounded-lg' : ''
    ]"
    :style="{
      backgroundImage: `url('/images/points/helix-points-${leagueBg}.png')`
    }"
  >
    <AssetLogo class="w-auto h-9" alt="Helix" />

    <p class="text-xl max-xs:text-xl mt-12 drop-shadow-lg">
      {{ $t('points.myTotalPoints') }}
    </p>
    <p class="text-5xl font-medium max-xs:text-5xl mt-2 mb-6 drop-shadow-md">
      {{ totalPointsToFixed }}
    </p>

    <div class="flex justify-between w-full">
      <p class="text-base font-medium drop-shadow-lg">
        {{ $t('points.league') }}: {{ league }}
      </p>
      <p class="text-base font-medium drop-shadow-lg">
        {{ $t('points.rank') }}: {{ rankToFixed }}
      </p>
    </div>

    <AppButton
      v-if="isShowDownloadButton"
      class="absolute bottom-4 right-4 flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-black hover:bg-blue-600 hover:border-blue-600 focus-within:ring-0"
      @click="downloadImage"
    >
      <p class="text-sm font-medium tracking-wide">
        {{ $t('points.saveImage') }}
      </p>
      <UIcon :name="NuxtUiIcons.Download2" class="size-4" />
    </AppButton>
  </div>
</template>
