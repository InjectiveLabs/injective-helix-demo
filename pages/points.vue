<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'

const now = useNow({ interval: 1000 })

const canvas = ref()
const isShowDownloadButton = ref(true)

const totalPoints = computed(() => '10,912,012')
const rank = computed(() => '1,888')
const league = computed(() => 'Gold')

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

    <div class="flex gap-6 max-lg:flex-col">
      <PartialsPointsTable />

      <div
        ref="canvas"
        class="relative flex flex-col items-center justify-center gap-2 max-xs:gap-1 py-[72px] min-w-[420px] max-xs:min-w-0 bg-contain bg-center bg-no-repeat bg-black rounded-lg"
        :style="{
          backgroundImage: `url('/images/points-banner-bg.png')`
        }"
      >
        <p class="text-2xl font-medium leading-tight max-xs:text-xl">
          {{ $t('points.myTotalPoints') }}
        </p>
        <p class="text-5xl font-bold max-xs:text-4xl">{{ totalPoints }}</p>
        <p class="text-5xl font-bold uppercase max-xs:text-4xl">
          {{ $t('points.rank') }} {{ rank }}
        </p>

        <AppButton
          v-if="isShowDownloadButton"
          class="absolute bottom-4 right-4 flex justify-center items-center gap-2 py-2 px-5 rounded-lg"
          @click="downloadImage"
        >
          <p class="leading-none text-xs font-medium tracking-wide">
            {{ $t('points.saveImage') }}
          </p>
          <UIcon :name="NuxtUiIcons.Download2" class="size-4" />
        </AppButton>
      </div>
    </div>
  </div>
</template>
