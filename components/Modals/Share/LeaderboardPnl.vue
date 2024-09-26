<script lang="ts" setup>
import { format } from 'date-fns'
import { toJpeg } from 'html-to-image'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, BusEvents, LeaderboardDuration } from '@/types'

const modalStore = useModalStore()
const { width } = useWindowSize()

const props = defineProps({
  pnl: {
    type: Number,
    default: 0
  },

  rank: {
    type: Number,
    default: 0
  },

  selectedDuration: {
    type: String as PropType<LeaderboardDuration>,
    default: ''
  }
})

const TIMESTAMP_FORMAT = 'yyyy-MM-dd kk:mm'

const canvas = ref()
const showSelectors = ref(true)

const now = useNow({ interval: 1000 })

const { valueToString: pnlToFormat, valueToBigNumber: pnlToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.pnl),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const isModalOpen = computed(() => modalStore.modals[Modal.ShareLeaderboardPnl])
const timestamp = computed(() => format(now.value, TIMESTAMP_FORMAT))

onMounted(() => {
  useEventBus(BusEvents.ShareLeaderboardPnlOpened).on(
    () => (showSelectors.value = true)
  )
})

onBeforeUnmount(onCloseModal)

function onCloseModal() {
  modalStore.closeModal(Modal.ShareLeaderboardPnl)
}

async function download() {
  showSelectors.value = false

  await nextTick()

  toJpeg(canvas.value).then((dataUrl) => {
    const link = document.createElement('a')
    link.download = `Leaderboard-PNL-${now.value}.jpeg`
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
    class="relative mx-auto sm:rounded-lg max-sm:h-full max-sm:max-w-full max-sm:w-full min-w-90% sm:max-w-4xl max-md:w-[90%] md:w-[700px] font-pingFang"
    wrapper-class="backdrop-filter backdrop-blur bg-gray-900 bg-opacity-90 max-sm:z-60"
    @modal:closed="onCloseModal"
  >
    <section ref="canvas" class="sm:aspect-[1.91/1] bg-black">
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

          <SharedIcon
            v-if="showSelectors"
            name="close"
            class="w-6 h-6 min-w-6 text-white hover:text-gray-500"
            @click="onCloseModal"
          />
        </div>

        <div
          class="space-y-3 md:space-y-6 flex-grow mt-6 md:mt-14 mb-28 sm:mb-16 md:mb-[56px]"
        >
          <div class="text-left">
            {{
              $t('leaderboard.pnl.currentDuration', {
                duration: $t(`leaderboard.pnl.duration.${selectedDuration}`)
              })
            }}
          </div>
          <div
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
          class="flex justify-between items-center text-xs md:text-sm text-gray-925 mb-3 sm:mb-1.5 md:mb-2.5"
        >
          <div class="flex items-center justify-start gap-2 flex-1">
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
              <SharedIcon name="download" class="w-4 h-4 min-w-4" />
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
  </SharedModalWrapper>
</template>
