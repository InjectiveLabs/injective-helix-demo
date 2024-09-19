<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { format } from 'date-fns'
import { toJpeg } from 'html-to-image'
import { Modal, BusEvents } from '@/types'

const modalStore = useModalStore()
const { width } = useWindowSize()

const props = withDefaults(
  defineProps<{
    leader: LeaderboardRow
  }>(),
  {
    leader: () => ({
      account: '',
      rank: 0,
      pnl: 0,
      volume: 0
    })
  }
)

const TIMESTAMP_FORMAT = 'yyyy-MM-dd kk:mm'

const canvas = ref()
const showSelectors = ref(true)

const now = useNow({ interval: 1000 })

const entries = computed(() =>
  new BigNumberInBase(props.leader.volume)
    .dividedBy(10)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
)

const isModalOpen = computed(
  () => modalStore.modals[Modal.ShareLeaderboardCompetition]
)
const timestamp = computed(() => format(now.value, TIMESTAMP_FORMAT))

onMounted(() => {
  useEventBus(BusEvents.ShareLeaderboardCompetitionOpened).on(
    () => (showSelectors.value = true)
  )
})

onBeforeUnmount(onCloseModal)

function onCloseModal() {
  modalStore.closeModal(Modal.ShareLeaderboardCompetition)
}

async function download() {
  showSelectors.value = false

  await nextTick()

  toJpeg(canvas.value).then((dataUrl) => {
    const link = document.createElement('a')
    link.download = `Leaderboard-Competition-${now.value}.jpeg`
    link.href = dataUrl
    link.click()

    onCloseModal()
  })
}

watchDebounced(
  width,
  (newWidth, oldWidth) => {
    if (oldWidth && newWidth >= 640) {
      onCloseModal()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <SharedModalWrapper
    v-if="isModalOpen"
    class="relative mx-auto sm:rounded-lg max-sm:h-full max-sm:max-w-full max-sm:w-full min-w-90% sm:max-w-4xl max-md:w-[90%] md:w-[700px]"
    wrapper-class="backdrop-filter backdrop-blur bg-gray-900 bg-opacity-90 max-sm:z-60"
    @close="onCloseModal"
  >
    <section ref="canvas" class="sm:aspect-[1.91/1] bg-black">
      <div
        class="p-6 bg-no-repeat bg-right bg-cover h-full w-full flex flex-col"
        :style="{
          backgroundImage: `url('/images/leaderboard/pnl-share-bg.webp')`
        }"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center justify-start">
            <AssetLogo class="w-auto h-6" alt="Helix" />
            <AssetLogoText class="block ml-2 h-6 text-white" />
          </div>

          <SharedIcon
            v-if="showSelectors"
            name="close"
            class="w-6 h-6 min-w-6 text-white hover:text-gray-500"
            @click="onCloseModal"
          />
        </div>

        <div class="space-y-6 flex-grow mt-10 mb-8">
          <div
            class="flex flex-col items-start gap-2 xs:gap-8 font-semibold truncate"
          >
            <span class="text-lg">
              {{ $t('leaderboard.header.numberOfEntries') }}
            </span>
            <span class="text-3xl">{{ entries }}</span>
          </div>
        </div>

        <div class="flex justify-between flex-wrap-reverse gap-2">
          <AssetBuiltOnInjective />

          <div class="flex items-center text-base gap-1">
            <span>{{ $t('trade.generated') }}:</span>
            <span>{{ timestamp }}</span>
          </div>
        </div>

        <div v-if="showSelectors" class="mx-auto">
          <div
            class="bg-blue-500 text-blue-900 font-semibold rounded-full flex items-center justify-center p-2 hover:bg-blue-100 hover:text-blue-500 cursor-pointer"
            @click="download"
          >
            <SharedIcon name="download" class="w-4 h-4 min-w-4" />
          </div>
        </div>
      </div>
    </section>
  </SharedModalWrapper>
</template>
