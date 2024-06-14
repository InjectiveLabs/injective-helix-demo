<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderbookFormattedRecord } from '@/types/worker'
import { colors } from '@/nuxt-config/tailwind'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const HEIGHT = 550
const MOBILE_HEIGHT = 450
const TOOLTIP_OFFSET = 10

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const props = defineProps({
  buys: {
    type: Array as PropType<OrderbookFormattedRecord[]>,
    required: true
  },

  sells: {
    type: Array as PropType<OrderbookFormattedRecord[]>,
    required: true
  }
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
const containerEl = ref<HTMLDivElement | null>(null)
const tooltipEl = ref<HTMLDivElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null

let isTooltipShown = false

const mouse = {
  x: 0,
  y: 0
}

function update() {
  if (!canvasEl.value) {
    return
  }

  const isMobile = window.innerWidth < 1024

  ctx = canvasEl.value.getContext('2d')

  if (!ctx) {
    return
  }

  const width = (canvasEl.value.width =
    containerEl.value?.getBoundingClientRect().width || 0)
  const height = isMobile ? MOBILE_HEIGHT : HEIGHT

  canvasEl.value.height = height

  // draw 10 grid lines in x and y
  ctx.strokeStyle = colors.brand[800]
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < 11; i++) {
    const y = (i / 10) * height
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()

  ctx.beginPath()
  for (let i = 0; i < 11; i++) {
    const x = (i / 10) * width
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height * 0.9)
  }
  ctx.stroke()

  const middlePrice = (+props.buys[0].price + +props.sells[0].price) / 2
  const rangeInPercent = 0.02
  const lowerPrice = middlePrice * (1 - rangeInPercent)
  const upperPrice = middlePrice * (1 + rangeInPercent)
  const range = upperPrice - lowerPrice

  let highestBuyVolume = 0
  let highestSellVolume = 0

  for (const record of props.buys) {
    if (Number(record.price) < lowerPrice) {
      break
    }
    highestBuyVolume = +record.totalVolume
  }

  for (const record of props.sells) {
    if (Number(record.price) > upperPrice) {
      break
    }
    highestSellVolume = +record.totalVolume
  }

  const highestVolume = Math.max(highestBuyVolume, highestSellVolume)

  function drawLine(
    records: OrderbookFormattedRecord[],
    color: string,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.strokeStyle = color
    ctx.beginPath()
    records.forEach((record, i) => {
      const x = lerp(0, width, (Number(record.price) - lowerPrice) / range)
      const y = lerp(
        height,
        0,
        (+record.totalVolume / highestVolume) * 0.8 + 0.1
      )
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }

  const initialMiddlePriceRecord = {
    price: String(middlePrice),
    totalVolume: '0',
    avgPrice: String(middlePrice),
    quantity: '0',
    totalQuantity: '0',
    volume: '0'
  }

  drawLine([initialMiddlePriceRecord, ...props.buys], colors.green[500], ctx)
  drawLine([initialMiddlePriceRecord, ...props.sells], colors.red[500], ctx)

  // draw mouse position
  if (isTooltipShown) {
    ctx.strokeStyle = colors.brand[700]
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(mouse.x, 0)
    ctx.lineTo(mouse.x, height)
    ctx.stroke()
    ctx.moveTo(width - mouse.x, 0)
    ctx.lineTo(width - mouse.x, height)
    ctx.stroke()
  }

  // price labels at bottom
  ctx.fillStyle = colors.gray[500]
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const nOfLabels = isMobile ? 5 : 10

  for (let i = 0; i <= nOfLabels; i++) {
    const x = (i / nOfLabels) * width
    const price = lerp(lowerPrice, upperPrice, i / nOfLabels)
    ctx.fillText(price.toFixed(2), x, height - 40)
  }

  ctx.strokeStyle = colors.gray[500]
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height * 0.9)
  ctx.lineTo(width, height * 0.9)
  ctx.stroke()

  const volumeforPriceAtCursor =
    mouse.x > 0.5 * width
      ? props.sells.find(
          (record) =>
            Number(record.price) >=
            lerp(lowerPrice, upperPrice, mouse.x / width)
        )?.totalVolume
      : props.buys.find(
          (record) =>
            Number(record.price) <=
            lerp(lowerPrice, upperPrice, mouse.x / width)
        )?.totalVolume

  updateTooltip({
    price: lerp(lowerPrice, upperPrice, mouse.x / width),
    volume: (volumeforPriceAtCursor && +volumeforPriceAtCursor) || 0
  })
}

function updateTooltip({ price, volume }: { price: number; volume: number }) {
  if (!tooltipEl.value) {
    return
  }

  if (!isTooltipShown) {
    tooltipEl.value.style.display = 'none'
    return
  }
  tooltipEl.value.style.display = 'grid'

  if (mouse.x > 0.5 * canvasEl.value!.width) {
    tooltipEl.value!.style.right = `${
      canvasEl.value!.width - mouse.x + TOOLTIP_OFFSET
    }px`
    tooltipEl.value!.style.left = 'auto'

    if (mouse.y > 0.5 * canvasEl.value!.height) {
      tooltipEl.value!.style.bottom = `${
        canvasEl.value!.height - mouse.y + TOOLTIP_OFFSET
      }px`
      tooltipEl.value!.style.top = 'auto'
    } else {
      tooltipEl.value!.style.top = `${mouse.y + TOOLTIP_OFFSET}px`
      tooltipEl.value!.style.bottom = 'auto'
    }
  } else {
    tooltipEl.value!.style.left = `${mouse.x + TOOLTIP_OFFSET}px`
    tooltipEl.value!.style.right = 'auto'
    if (mouse.y > 0.5 * canvasEl.value!.height) {
      tooltipEl.value!.style.bottom = `${
        canvasEl.value!.height - mouse.y + TOOLTIP_OFFSET
      }px`
      tooltipEl.value!.style.top = 'auto'
    } else {
      tooltipEl.value!.style.top = `${mouse.y + TOOLTIP_OFFSET}px`
      tooltipEl.value!.style.bottom = 'auto'
    }
  }

  const innerHtml = `
    <div >Price:</div>
    <div class="text-white font-mono text-right">${new BigNumberInBase(
      price
    ).toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}</div>
    <div>Volume:</div>
    <div class="text-white font-mono text-right">${new BigNumberInBase(
      volume
    ).toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}</div>
  `
  tooltipEl.value!.innerHTML = innerHtml
}

function handleMouseMove(e: MouseEvent) {
  mouse.x = e.offsetX
  mouse.y = e.offsetY

  update()
}

function handleMouseEnter() {
  isTooltipShown = true
  update()
}

function handleMouseLeave() {
  isTooltipShown = false
  update()
}

onMounted(() => {
  update()
})

watch(() => [props.buys, props.sells], update)

useResizeObserver(containerEl, update)
</script>

<template>
  <div ref="containerEl" class="w-full absolute left-0 right-0">
    <canvas
      ref="canvasEl"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
    </canvas>

    <div
      ref="tooltipEl"
      class="absolute pointer-events-none grid grid-cols-[auto_auto] bg-brand-850/10 backdrop-blur-sm p-2 rounded-lg border-gray-700 border text-[11px] text-gray-500 gap-2 z-50"
    ></div>
  </div>
</template>
