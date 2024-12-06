<script lang="ts" setup>
import { format } from 'date-fns'
import { toJpeg } from 'html-to-image'
import { BigNumberInBase } from '@injectivelabs/utils'
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { LEADERBOARD_VOLUME_PER_ENTRY } from '@/app/utils/constants'
import { Modal, BusEvents } from '@/types'

const modalStore = useSharedModalStore()
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
    .dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
    .integerValue(BigNumberInBase.ROUND_DOWN)
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
    wrapper-class="backdrop-filter backdrop-blur bg-coolGray-900 bg-opacity-90 max-sm:z-60"
    @modal:closed="onCloseModal"
  >
    <section ref="canvas" class="sm:aspect-[1.91/1] bg-black">
      <div
        class="p-10 bg-no-repeat bg-right bg-cover h-full w-full flex flex-col items-start"
        :style="{
          backgroundImage: `url('/images/leaderboard/share/bg-competition.webp')`
        }"
      >
        <div class="flex justify-between items-start w-full mb-10">
          <AssetLogoWhite class="w-auto h-6" alt="Helix" />

          <UIcon
            v-if="showSelectors"
            :name="NuxtUiIcons.Close"
            class="w-6 h-6 min-w-6 text-black hover:text-coolGray-500"
            @click="onCloseModal"
          />
        </div>

        <div class="text-3xl text-left mb-4">
          <i18n-t
            keypath="leaderboard.competition.share.raffleTickets"
            tag="div"
            class="font-light max-w-[280px]"
          >
            <template #tickets>
              <span class="font-semibold">{{ entries }}</span>
            </template>
          </i18n-t>
          <div class="font-semibold flex items-center">
            <span class="inline-block w-12 h-[2px] bg-white mr-2"></span>
            <div>
              {{ $t('leaderboard.competition.share.likeAG') }}
            </div>
          </div>
        </div>

        <div class="max-w-[350px] text-left mb-6 font-semibold">
          {{ $t('leaderboard.competition.share.joinCompetition') }}
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div>
              <div class="bg-white rounded-lg p-2">
                <img
                  class="w-8 h-8 min-w-8"
                  src="/images/leaderboard/share/qr/competition.png"
                />
              </div>
            </div>

            <div
              class="flex flex-col text-left text-base font-semibold leading-5 text-sm"
            >
              <div>
                {{ $t('leaderboard.competition.termsAndConditionsApply') }}
              </div>
              <div class="flex items-center gap-1">
                <span>{{ $t('leaderboard.screenshot') }}</span>
                <span>{{ timestamp }}</span>
              </div>
            </div>
          </div>

          <div v-if="showSelectors" class="mx-auto pl-4">
            <div
              class="bg-blue-500 text-blue-900 font-semibold rounded-full flex items-center justify-center p-2 hover:bg-blue-100 hover:text-blue-500 cursor-pointer"
              @click="download"
            >
              <UIcon :name="NuxtUiIcons.Download" class="w-4 h-4 min-w-4" />
            </div>
          </div>

          <div />
        </div>
      </div>
    </section>
  </SharedModalWrapper>
</template>
