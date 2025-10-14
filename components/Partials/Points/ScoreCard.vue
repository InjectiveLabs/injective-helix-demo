<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { PointsLeague } from '@/types'

const pointsStore = usePointsStore()
const sharedWalletStore = useSharedWalletStore()
const now = useNow({ interval: 1000 })

const beltImageList = {
  [PointsLeague.Blue]: 'blue-belt',
  [PointsLeague.Black]: 'black-belt',
  [PointsLeague.White]: 'white-belt',
  [PointsLeague.Orange]: 'orange-belt',
  [PointsLeague.Purple]: 'purple-belt'
}

const canvas = ref()
const status = reactive(new Status(StatusType.Idle))

const league = computed(
  () =>
    (pointsStore?.accountPoints?.league as PointsLeague) || PointsLeague.White
)

const rank = computed(() => pointsStore.accountPoints?.rank || '0')

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
    ref="canvas"
    :style="{ backgroundImage: 'url(/images/points/s2-bg.png)' }"
    class="flex items-center justify-between p-4 bg-cover bg-center bg-no-repeat w-full max-w-[390px] aspect-[1/0.45] rounded-2xl bg-black text-white"
  >
    <div class="flex items-center">
      <img
        class="w-14"
        :src="`/images/points/level/${beltImageList[league]}.png`"
      />

      <div class="ml-4 mr-6">
        <p class="text-sm">{{ $t('points.level') }}</p>
        <p class="font-medium">
          {{
            $t(
              `points.leagues.${
                pointsStore?.accountPoints?.league || PointsLeague.White
              }`
            )
          }}
        </p>
      </div>

      <div>
        <p class="text-sm">
          {{ $t('points.rank') }}
        </p>

        <p class="font-medium">
          <SharedAmount
            v-bind="{
              amount: rank,
              showZeroAsEmDash: true,
              shouldAbbreviate: false
            }"
          />
        </p>
      </div>
    </div>

    <AppButton
      v-if="status.isIdle() && sharedWalletStore.isUserConnected"
      variant="primary-outline"
      :class="[
        'flex justify-center items-center gap-2 w-[115px] h-10 rounded-lg !text-azure-blue-350 p-2 border-[#8C9199]'
      ]"
      @click="downloadImage"
    >
      <UIcon class="size-5" :name="NuxtUiIcons.Download2" />
      <p class="text-sm leading-none font-medium mr-2">
        {{ $t('points.share') }}
      </p>
    </AppButton>
  </div>
</template>
