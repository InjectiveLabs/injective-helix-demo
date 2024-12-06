<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
import { PointsLeague } from '@/types'

const now = useNow({ interval: 1000 })

const canvas = ref()
const isShowDownloadButton = ref(true)

const totalPoints = computed(() => '10,912,012')
const rank = computed(() => '1,888')
const league = computed(() => PointsLeague.Polaris)

const leagueBg = computed(() =>
  league.value === PointsLeague.Polaris
    ? 'bg-1'
    : league.value === PointsLeague.Plasma
    ? 'bg-2'
    : 'bg-3'
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
    class="pt-16 pb-32 px-48 max-xs:pt-8 max-xs:px-4 max-xs:pb-16 max-xl:pt-12 max-xl:px-12 max-xl:pb-24 max-3xl:px-40 max-w-[1400px]"
  >
    <div class="flex flex-col gap-4 max-xs:gap-1">
      <h1 class="text-3xl max-xs:text-2xl">{{ $t('points.title') }}</h1>
      <p class="text-base tracking-wide max-xs:text-sm">
        {{ $t('points.description') }}
      </p>
    </div>

    <PartialsPointsStats v-bind="{ totalPoints, rank, league }" />

    <div class="flex gap-6 max-lg:flex-col max-lg:items-center">
      <PartialsPointsTable />

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
        <p
          class="text-5xl font-medium max-xs:text-4xl mt-2 mb-6 drop-shadow-md"
        >
          {{ totalPoints }}
        </p>

        <div class="flex justify-between w-full">
          <p class="text-base font-medium drop-shadow-lg">
            {{ $t('points.league') }}: {{ league }}
          </p>
          <p class="text-base font-medium drop-shadow-lg">
            {{ $t('points.rank') }}: {{ rank }}
          </p>
        </div>

        <AppButton
          v-if="isShowDownloadButton"
          class="absolute bottom-4 right-4 flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-white hover:bg-blue-600 hover:border-blue-600 focus-within:ring-0"
          @click="downloadImage"
        >
          <UIcon :name="NuxtUiIcons.Download2" class="size-4" />
          <p class="text-sm font-semibold tracking-wide">
            {{ $t('points.saveImage') }}
          </p>
        </AppButton>
      </div>
    </div>
  </div>
</template>
