<script lang="ts" setup>
import {
  SharedUiSpotMarket,
  SharedUiOrderbookWithSequence
} from '@shared/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

const lerp = (a: number, b: number, t: number) => a + t * (b - a)

const HANDLE_WIDTH = 50
const HANDLE_OPACITY = 0

const COLOR = '#0EE29Bee'

const SVG_PROPS = {
  width: 1000,
  height: 400
}

const props = defineProps({
  min: {
    type: String,
    required: true
  },

  max: {
    type: String,
    required: true
  },

  lower: {
    type: String,
    required: true
  },

  upper: {
    type: String,
    required: true
  },

  currentPrice: {
    type: String,
    required: true
  },

  orderbook: {
    type: Object as PropType<SharedUiOrderbookWithSequence>,
    default: undefined
  },

  decimalPlaces: {
    type: Number,
    required: true
  },

  market: {
    type: Object as PropType<SharedUiSpotMarket>,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:min': [value: string]
  'update:max': [value: string]
  'update:lower': [value: string]
  'update:upper': [value: string]
}>()

const isLowerHandleClicked = ref(false)
const isUpperHandleClicked = ref(false)
const isHovered = ref(false)

const orderbook = ref(props.orderbook)

const lowerHandleX = computed(() => {
  const range = Number(props.max) - Number(props.min)
  const value = Number(props.lower) - Number(props.min)

  const normalizedValue = value / range

  return (
    lerp(
      HANDLE_WIDTH / 2,
      SVG_PROPS.width - HANDLE_WIDTH / 2,
      normalizedValue
    ) -
    HANDLE_WIDTH / 2
  )
})

const upperHandleX = computed(() => {
  const range = Number(props.max) - Number(props.min)
  const value = Number(props.upper) - Number(props.min)

  const normalizedValue = value / range

  return (
    lerp(
      HANDLE_WIDTH / 2,
      SVG_PROPS.width - HANDLE_WIDTH / 2,
      normalizedValue
    ) -
    HANDLE_WIDTH / 2
  )
})

const currentPriceX = computed(() => {
  const range = Number(props.max) - Number(props.min)
  const value = Number(props.currentPrice) - Number(props.min)

  const normalizedValue = value / range

  return (
    lerp(
      HANDLE_WIDTH / 2,
      SVG_PROPS.width - HANDLE_WIDTH / 2,
      normalizedValue
    ) -
    HANDLE_WIDTH / 2
  )
})

const rulerValues = computed(() => {
  const numbers = generateEvenlySpacedNumbers(+props.min, +props.max, 8)

  return numbers.map((number) => {
    const range = Number(props.max) - Number(props.min)
    const value = number - Number(props.min)

    const normalizedValue = value / range

    const priceValue = new BigNumberInBase(number)

    const display = priceValue.gt(0.00001)
      ? priceValue.toFormat(props.decimalPlaces)
      : '0...' + priceValue.toFormat(props.decimalPlaces).slice(-6)

    return {
      display,
      value:
        lerp(
          HANDLE_WIDTH / 2,
          SVG_PROPS.width - HANDLE_WIDTH / 2,
          normalizedValue
        ) -
        HANDLE_WIDTH / 2
    }
  })
})

const orderbookVolume = computed(() => {
  if (!orderbook.value || !props.market) {
    return []
  }

  const orders = [...orderbook.value.buys, ...orderbook.value.sells]

  return orders
    .map((order) => ({
      price: new BigNumberInWei(order.price)
        .toBase(
          props.market!.quoteToken.decimals - props.market!.baseToken.decimals
        )
        .toNumber(),
      quantity: new BigNumberInWei(order.quantity)
        .toBase(props.market!.baseToken.decimals)
        .toNumber()
    }))
    .filter(
      (order) =>
        Number(order.price) > Number(props.min) &&
        Number(order.price) < Number(props.max)
    )
    .sort((a, b) => a.price - b.price)
})

const steps = computed(() => {
  return Number(props.currentPrice) / 100
})

const orderbookVolumeQuantized = computed(() => {
  const MIN = Number(props.min)
  const MAX = Number(props.max)

  const STEP = steps.value

  const orderbookQuantized = [] as { price: number; quantity: number }[]

  for (let i = MIN; i < MAX; i += STEP) {
    const volumes = orderbookVolume.value
      .filter((volume) => volume.price >= i && volume.price < i + STEP)
      .reduce((sum, quantity) => sum + quantity.quantity, 0)

    orderbookQuantized.push({ price: i, quantity: volumes })
  }

  return orderbookQuantized
})

const highestOrderbookQuantity = computed(() =>
  Math.max(...orderbookVolumeQuantized.value.map((o) => o.quantity))
)

const volumePoints = computed(() =>
  orderbookVolumeQuantized.value.map((order) => {
    const range = Number(props.max) - Number(props.min)
    const value = Number(order.price) - Number(props.min)

    const normalizedValue = value / range
    const normalizedHeight = order.quantity / highestOrderbookQuantity.value

    return {
      x:
        lerp(
          HANDLE_WIDTH / 2,
          SVG_PROPS.width - HANDLE_WIDTH / 2,
          normalizedValue
        ) -
        HANDLE_WIDTH / 2,
      height: lerp(0, SVG_PROPS.height, normalizedHeight)
    }
  })
)

const rectWidth = computed(() => {
  const range = Number(props.max) - Number(props.min)
  const value = Number(props.min) + steps.value - Number(props.min)

  const normalizedValue = value / range

  return (
    lerp(
      HANDLE_WIDTH / 2,
      SVG_PROPS.width - HANDLE_WIDTH / 2,
      normalizedValue
    ) -
    HANDLE_WIDTH / 2
  )
})

function mouseMove(ev: MouseEvent) {
  if (isLowerHandleClicked.value) {
    const amount = getAmountFromMouseEvent(ev)

    if (amount >= +props.upper) {
      emit('update:upper', amount.toString())
    }

    emit('update:lower', amount.toString())
  }

  if (isUpperHandleClicked.value) {
    const amount = getAmountFromMouseEvent(ev)

    if (+props.lower >= +amount) {
      emit('update:lower', amount.toString())
    }

    emit('update:upper', amount.toString())
  }
}

function getAmountFromMouseEvent(ev: MouseEvent) {
  const svgMousePos =
    (ev.offsetX / (ev.currentTarget as HTMLElement).clientWidth) *
    SVG_PROPS.width

  let value

  if (svgMousePos < HANDLE_WIDTH / 2) {
    value = 0
  } else if (svgMousePos > SVG_PROPS.width - HANDLE_WIDTH / 2) {
    value = 1
  } else {
    value = lerp(
      0,
      1,
      (svgMousePos - HANDLE_WIDTH / 2) / (SVG_PROPS.width - HANDLE_WIDTH)
    )
  }

  return lerp(+props.min, +props.max, value)
}

function mouseUp() {
  isLowerHandleClicked.value = false
  isUpperHandleClicked.value = false
}

function generateEvenlySpacedNumbers(
  a: number,
  b: number,
  count: number
): number[] {
  const result: number[] = []

  if (count < 2) {
    return result
  }

  const step = (b - a) / (count - 1)

  for (let i = 0; i < count; i++) {
    const value = +(a + step * i)
    result.push(value)
  }

  return result
}
</script>

<template>
  <div class="border py-5 select-none">
    <svg
      :viewBox="`0 0 ${SVG_PROPS.width} ${SVG_PROPS.height + 50}`"
      class="overflow-visible"
      :class="{ 'cursor-[ew-resize]': isHovered }"
      @mousemove.passive="mouseMove"
      @mouseup.passive="mouseUp"
    >
      <mask id="myMask">
        <rect width="100%" height="100%" fill="white" />
      </mask>

      <g id="volume" v-memo="[props.min, props.max]" mask="url(#myMask)">
        <rect
          v-for="({ height, x }, i) in volumePoints"
          :key="`point-${i}-{${x}-${height}}`"
          :x="x"
          :y="SVG_PROPS.height - height"
          :width="rectWidth"
          :height="height"
          fill="#0EE29B33"
        />
      </g>

      <g id="handle-pads" mask="url(#myMask)">
        <rect
          :x="lowerHandleX + 2"
          :y="0"
          :width="HANDLE_WIDTH / 2"
          :height="50"
          ry="8"
          rx="2"
          :fill="COLOR"
        />

        <line
          :x1="lowerHandleX + HANDLE_WIDTH / 4"
          :x2="lowerHandleX + HANDLE_WIDTH / 4"
          :y1="10"
          :y2="40"
          stroke="white"
          stroke-width="2"
        />

        <line
          :x1="lowerHandleX + HANDLE_WIDTH / 4 + 6"
          :x2="lowerHandleX + HANDLE_WIDTH / 4 + 6"
          :y1="10"
          :y2="40"
          stroke="white"
          stroke-width="2"
        />

        <rect
          :x="upperHandleX + HANDLE_WIDTH / 2"
          :y="0"
          :width="HANDLE_WIDTH / 2"
          :height="50"
          ry="8"
          rx="2"
          :fill="COLOR"
        />

        <line
          :x1="upperHandleX + HANDLE_WIDTH / 4 + HANDLE_WIDTH / 2 - 2"
          :x2="upperHandleX + HANDLE_WIDTH / 4 + HANDLE_WIDTH / 2 - 2"
          :y1="10"
          :y2="40"
          stroke="white"
          stroke-width="2"
        />

        <line
          :x1="upperHandleX + HANDLE_WIDTH / 4 + 6 + HANDLE_WIDTH / 2 - 2"
          :x2="upperHandleX + HANDLE_WIDTH / 4 + 6 + HANDLE_WIDTH / 2 - 2"
          :y1="10"
          :y2="40"
          stroke="white"
          stroke-width="2"
        />
      </g>

      <g>
        <text
          fill="white"
          font-size="2rem"
          :x="lowerHandleX - 10 < -10 ? HANDLE_WIDTH * 2.5 : lowerHandleX - 10"
          :y="35"
          text-anchor="end"
        >
          {{ Number(props.lower).toFixed(props.decimalPlaces) }}
        </text>

        <text
          fill="white"
          font-size="2rem"
          :x="
            upperHandleX + HANDLE_WIDTH + 10 > SVG_PROPS.width
              ? SVG_PROPS.width
              : upperHandleX + HANDLE_WIDTH + 10
          "
          :y="35"
          text-anchor="start"
        >
          {{ Number(props.upper).toFixed(props.decimalPlaces) }}
        </text>
      </g>

      <g id="grid-range" mask="url(#myMask)">
        <rect
          v-if="upperHandleX - lowerHandleX > 0"
          :x="lowerHandleX + HANDLE_WIDTH / 2"
          y="0"
          :width="upperHandleX - lowerHandleX"
          :height="SVG_PROPS.height"
          fill="#ffffff11"
        />
      </g>

      <g id="ruler" mask="url(#myMask)">
        <line
          x1="0"
          :y1="SVG_PROPS.height"
          :x2="SVG_PROPS.width"
          :y2="SVG_PROPS.height"
          stroke="white"
        />

        <g
          v-for="({ display, value }, i) in rulerValues"
          id="ruler-values"
          :key="`${value}-${display}-${i}`"
        >
          <line
            :x1="value + HANDLE_WIDTH / 2"
            :x2="value + HANDLE_WIDTH / 2"
            :y1="SVG_PROPS.height"
            :y2="SVG_PROPS.height + 20"
            stroke="white"
          />

          <g>
            <text
              :x="value + HANDLE_WIDTH / 2"
              fill="#aaaaaa55"
              :y="SVG_PROPS.height + 50"
              text-anchor="middle"
              font-size="1.5rem"
            >
              {{ display }}
            </text>
          </g>
        </g>
      </g>

      <g id="min-max-lines" mask="url(#myMask)">
        <rect
          :x="lowerHandleX + HANDLE_WIDTH / 2"
          y="0"
          :width="2"
          :height="SVG_PROPS.height"
          :fill="COLOR"
        />

        <rect
          :x="upperHandleX + HANDLE_WIDTH / 2"
          y="0"
          :width="2"
          :height="SVG_PROPS.height"
          :fill="COLOR"
        />

        <rect
          :x="currentPriceX + HANDLE_WIDTH / 2"
          y="0"
          :width="2"
          :height="SVG_PROPS.height"
          :fill="COLOR"
        />
      </g>

      <g id="lower-handle">
        <rect
          :x="lowerHandleX"
          y="0"
          :width="HANDLE_WIDTH"
          :height="SVG_PROPS.height"
          fill="red"
          :opacity="HANDLE_OPACITY"
          @mousedown.passive="isLowerHandleClicked = true"
          @mouseenter.passive="isHovered = true"
          @mouseleave.passive="isHovered = false"
        />
      </g>

      <g id="upper-handle">
        <rect
          :x="upperHandleX"
          y="0"
          :width="HANDLE_WIDTH"
          :height="SVG_PROPS.height"
          fill="blue"
          :opacity="HANDLE_OPACITY"
          @mousedown.passive="isUpperHandleClicked = true"
          @mouseenter.passive="isHovered = true"
          @mouseleave.passive="isHovered = false"
        />
      </g>
    </svg>
  </div>
</template>
