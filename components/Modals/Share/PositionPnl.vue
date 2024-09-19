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
const showAmount = ref(true)
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
    class="relative mx-auto sm:rounded-lg max-sm:h-full max-sm:max-w-full max-sm:w-full min-w-90% sm:max-w-4xl max-md:w-[90%] md:w-[700px]"
    wrapper-class="backdrop-filter backdrop-blur bg-gray-900 bg-opacity-90 max-sm:z-40"
    @close="onCloseModal"
  >
    <section v-if="market" ref="canvas" class="sm:aspect-[1.91/1] bg-black">
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

        <div class="space-y-6 flex-grow my-8">
          <div class="flex items-center gap-3">
            <span
              v-if="position.direction === TradeDirection.Long"
              class="text-green-500"
            >
              {{ $t('trade.long') }}
            </span>
            <span v-else class="text-red-500">{{ $t('trade.short') }}</span>

            <template v-if="showLeverage">
              <span class="border-r w-1 h-4 border-blue-500" />

              <span>
                {{ effectiveLeverage.toFormat(2) }}
                <span class="text-gray-300">&times;</span>
              </span>
            </template>

            <span class="border-r w-1 h-4 border-blue-500" />

            <div class="flex items-center justify-start">
              <div v-if="market.baseToken">
                <CommonTokenIcon is-sm :token="market.baseToken" />
              </div>
              <div class="ml-2">
                <span class="text-white text-xs">
                  {{ position.ticker }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="flex items-end gap-2 xs:gap-8 font-semibold flex-wrap"
            :class="{
              'text-green-500': pnl.gte(0),
              'text-red-500': pnl.lt(0)
            }"
          >
            <span class="text-6xl leading-[3rem]">
              {{
                (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2)
              }}%
            </span>
            <div v-if="showAmount" class="flex items-center text-xl">
              <span>(</span>
              <span>{{ pnl.toFixed(2) }}</span>
              <span class="ml-1">
                {{ market.quoteToken.symbol }}
              </span>
              <span>)</span>
            </div>
          </div>

          <div class="flex items-end">
            <div v-if="showPrice" class="flex gap-8 text-sm">
              <div class="flex flex-col gap-1 text-gray-500">
                <span class="capitalize">{{ $t('trade.entry_price') }}</span>
                <span>{{ $t('trade.mark_price') }}</span>
              </div>

              <div class="flex flex-col gap-1">
                <span>{{ priceToFormat }}</span>
                <span>{{ markPriceToFormat }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between flex-wrap-reverse gap-2">
          <AssetBuiltOnInjective />

          <div class="flex items-center text-base gap-1">
            <span>{{ $t('trade.generated') }}:</span>
            <span>{{ timestamp }}</span>
          </div>
        </div>

        <div
          v-if="showSelectors"
          class="flex justify-between items-center mt-4"
        >
          <div class="flex items-center justify-start w-full gap-4">
            <AppCheckbox v-model="showLeverage">
              {{ $t('trade.leverage') }}
            </AppCheckbox>

            <AppCheckbox v-model="showAmount">
              {{ $t('trade.amount') }}
            </AppCheckbox>

            <AppCheckbox v-model="showPrice">
              {{ $t('trade.price') }}
            </AppCheckbox>
          </div>

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
