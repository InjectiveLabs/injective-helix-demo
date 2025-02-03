<script lang="ts" setup>
import { format } from 'date-fns'
import { toJpeg } from 'html-to-image'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, BusEvents, LeaderboardDuration } from '@/types'

const modalStore = useSharedModalStore()
const { t } = useLang()
const { width } = useWindowSize()

const props = withDefaults(
  defineProps<{
    pnl?: number
    rank?: number
    volume?: number
    isVolumeCampaign?: boolean
    selectedDuration?: LeaderboardDuration
  }>(),
  {
    pnl: 0,
    rank: 0,
    volume: 0,
    isVolumeCampaign: false,
    selectedDuration: undefined
  }
)

const TIMESTAMP_FORMAT = 'yyyy-MM-dd kk:mm'

const canvas = ref()
const showSelectors = ref(true)

const now = useNow({ interval: 1000 })

const { valueToString: pnlToFormat, valueToBigNumber: pnlToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.pnl),
    { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
  )

const { valueToString: volumeToFormat } = useSharedBigNumberFormatter(
  computed(() => props.volume),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const timestamp = computed(() => format(now.value, TIMESTAMP_FORMAT))

const statsModalTitle = computed(() =>
  props.isVolumeCampaign
    ? t('leaderboard.competition.tradingVolume')
    : props.selectedDuration
    ? t('leaderboard.pnl.currentDuration', {
        duration: t(`leaderboard.pnl.duration.${props.selectedDuration}`)
      })
    : t('leaderboard.pnl.tradingPnl')
)

onMounted(() => {
  useEventBus(BusEvents.ShareLeaderboardStatsOpened).on(
    () => (showSelectors.value = true)
  )
})

onBeforeUnmount(onCloseModal)

function onCloseModal() {
  modalStore.closeModal(Modal.ShareLeaderboardStats)
}

async function download() {
  showSelectors.value = false

  await nextTick()

  toJpeg(canvas.value).then((dataUrl) => {
    const link = document.createElement('a')

    link.download = `Leaderboard-${props.isVolumeCampaign ? 'Volume' : 'PNL'}-${
      now.value
    }.jpeg`

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
  <AppModal
    v-model="modalStore.modals[Modal.ShareLeaderboardPnl]"
    v-bind="{
      isAlwaysOpen: !showSelectors,
      cardUi: { body: { padding: 'p-0 sm:p-0' } },
      ui: {
        padding: 'p-0',
        overlay: { base: 'backdrop-filter backdrop-blur' },
        width:
          'max-sm:w-full max-md:w-[90%] md:w-[700px] sm:max-w-full max-sm:h-full'
      }
    }"
  >
    <section ref="canvas" class="sm:aspect-[1.85/1] bg-black">
      <div
        class="pt-8 px-8 bg-no-repeat bg-right bg-cover h-full w-full flex flex-col"
        :style="{
          backgroundImage: `url('/images/leaderboard/share/bg-positive.webp')`
        }"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center justify-start">
            <AssetLogo class="w-auto h-6" alt="Helix" />
            <AssetLogoText class="block ml-2 h-6 text-white" />
          </div>
        </div>

        <div
          class="space-y-3 md:space-y-6 flex-grow mt-6 md:mt-14 mb-28 sm:mb-16 md:mb-[56px]"
        >
          <div class="text-left">
            {{ statsModalTitle }}
          </div>

          <div
            v-if="isVolumeCampaign"
            class="flex items-end gap-2 xs:gap-8 font-semibold flex-wrap text-3xl md:text-5xl leading-[3rem] truncate text-green-500"
          >
            ${{ volumeToFormat }}
          </div>

          <div
            v-else
            class="flex items-end gap-2 xs:gap-8 font-semibold flex-wrap text-3xl md:text-5xl leading-[3rem] truncate"
            :class="{
              'text-green-500': pnlToBigNumber.gte(0),
              'text-red-500': pnlToBigNumber.lt(0)
            }"
          >
            ${{ pnlToFormat }}
          </div>

          <div
            class="flex items-end gap-2 font-semibold flex-wrap text-3xl truncate text-blue-450"
          >
            <span> {{ $t('leaderboard.header.rank') }}: </span>
            <span>{{ rank }}</span>
          </div>
        </div>

        <div
          class="flex justify-between items-center text-xs md:text-sm text-coolGray-925 mb-3 sm:mb-1.5 md:mb-2.5"
        >
          <div class="flex items-center justify-start gap-2 mr-2 flex-1">
            <div class="bg-white p-1">
              <img
                class="w-8 h-8 min-w-8"
                src="/images/leaderboard/share/qr/markets.png"
              />
            </div>

            <span>{{ $t('leaderboard.helix') }}</span>
          </div>

          <div class="flex-grow-0 mx-auto">
            <div
              v-if="showSelectors"
              class="bg-blue-500 text-blue-900 font-semibold rounded-full flex items-center justify-center p-2 hover:bg-blue-100 hover:text-blue-500 cursor-pointer"
              @click="download"
            >
              <UIcon :name="NuxtUiIcons.Download" class="w-4 h-4 min-w-4" />
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row items-start justify-end gap-1 flex-1 ml-2 sm:ml-0"
          >
            <span>{{ $t('leaderboard.timeStamp') }}:</span>
            <span>{{ timestamp }}</span>
          </div>
        </div>
      </div>
    </section>
  </AppModal>
</template>
