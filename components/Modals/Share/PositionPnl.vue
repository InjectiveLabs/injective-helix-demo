<script lang="ts" setup>
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { format } from 'date-fns'
import { toJpeg } from 'html-to-image'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, BusEvents } from '@/types'

const modalStore = useModalStore()
const { width } = useWindowSize()

const props = withDefaults(
  defineProps<{
    position: Position | PositionV2
  }>(),
  {}
)

const TIMESTAMP_FORMAT = 'yyyy-MM-dd kk:mm'

const canvas = ref()
const showPrice = ref(true)
const showLeverage = ref(true)
const showSelectors = ref(true)

const { pnl, market, percentagePnl, price, markPrice, effectiveLeverage } =
  useDerivativePosition(computed(() => props.position))

const now = useNow({ interval: 1000 })

const { valueToString: markPriceToFormat } = useSharedBigNumberFormatter(
  computed(() => markPrice.value),
  {
    decimalPlaces:
      market.value?.quoteToken.decimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceToFormat } = useSharedBigNumberFormatter(
  computed(() => price.value),
  {
    decimalPlaces:
      market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const isModalOpen = computed(() => modalStore.modals[Modal.SharePositionPnl])
const timestamp = computed(() => format(now.value, TIMESTAMP_FORMAT))

onMounted(() => {
  useEventBus(BusEvents.SharePositionOpened).on(() => {
    showSelectors.value = true
  })
})

function onCloseModal() {
  modalStore.closeModal(Modal.SharePositionPnl)
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
    wrapper-class="backdrop-filter backdrop-blur bg-gray-900 bg-opacity-90 max-sm:z-40"
    @close="onCloseModal"
  >
    <section v-if="market" ref="canvas" class="sm:aspect-[1.91/1] bg-black">
      <div
        class="pt-6 px-6 bg-no-repeat bg-center bg-cover h-full w-full flex flex-col"
        :style="{
          backgroundImage: `url('/images/leaderboard/share/bg-${
            percentagePnl.gte(0) ? 'positive' : 'negative'
          }.webp')`
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
          class="max-sm:space-y-2 sm:space-y-3 md:space-y-5 lg:space-y-6 flex-grow mt-8 mb-8 sm:mb-2 md:mb-7 lg:mb-4"
        >
          <div class="flex items-center gap-3">
            <span
              v-if="position.direction === TradeDirection.Long"
              class="text-primary-400"
            >
              {{ $t('trade.long') }}
            </span>
            <span v-else class="text-red-500">{{ $t('trade.short') }}</span>

            <template v-if="showLeverage">
              <span class="border-r w-1 h-4 border-white" />

              <span>
                <span>{{ effectiveLeverage.toFormat(2) }}</span>
                <span class="text-gray-300">&times;</span>
              </span>
            </template>

            <span class="border-r w-1 h-4 border-white" />

            <div class="ml-2">
              <span class="text-white text-xs">
                {{ position.ticker }}
              </span>
            </div>
          </div>

          <div>
            {{ $t('trade.pnlPercent') }}
          </div>
          <div
            class="flex items-end gap-2 xs:gap-8 font-semibold flex-wrap"
            :class="{
              'text-green-500': pnl.gte(0),
              'text-red-500': pnl.lt(0)
            }"
          >
            <span class="text-4xl md:text-6xl leading-[3rem]">
              {{
                (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2)
              }}%
            </span>
          </div>

          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between"
          >
            <div
              class="flex gap-8 text-sm"
              :class="[showPrice ? 'visible' : 'invisible']"
            >
              <div class="flex flex-col gap-1">
                <span class="capitalize">{{ $t('trade.entry_price') }}</span>
                <span class="text-primary-400">{{ priceToFormat }}</span>
              </div>

              <div class="flex flex-col gap-1">
                <span>{{ $t('trade.mark_price') }}</span>
                <span class="text-primary-400">{{ markPriceToFormat }}</span>
              </div>
            </div>

            <div
              v-if="showSelectors"
              class="flex justify-between items-center mt-4 text-black bg-white rounded"
            >
              <div class="flex items-center justify-start w-full gap-4">
                <AppCheckbox2 v-model="showLeverage">
                  {{ $t('trade.leverage') }}
                </AppCheckbox2>

                <AppCheckbox2 v-model="showPrice">
                  {{ $t('trade.price') }}
                </AppCheckbox2>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex justify-between items-center text-xs md:text-sm text-gray-925 mb-2.5 sm:mb-1.5 md:mb-2.5"
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
