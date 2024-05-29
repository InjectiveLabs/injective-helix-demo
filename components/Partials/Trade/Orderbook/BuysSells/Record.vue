<script setup lang="ts">
import { OrderbookFormattedRecord } from '@/types/worker'
import { BusEvents } from '@/types'

const props = defineProps({
  isBuy: Boolean,
  isActive: Boolean,

  record: {
    type: Object as PropType<OrderbookFormattedRecord>,
    required: true
  },

  index: {
    type: Number,
    default: -1
  },

  highestVolume: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'set:index': [index: number]
}>()

const showPriceFlash = ref(false)
const showQuantityFlash = ref(false)

function setIndex() {
  emit('set:index', props.index)
}

const { valueToString: totalVolumeToString } = useSharedBigNumberFormatter(
  computed(() => props.record.totalVolume),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.record.totalVolume)
    ),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: volumeToString } = useSharedBigNumberFormatter(
  computed(() => props.record.volume),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.record.volume)
    ),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(
  computed(() => props.record.price),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.record.price)
    ),
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  computed(() => props.record.quantity),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.record.quantity)
    ),
    displayAbsoluteDecimalPlace: true
  }
)

watch(
  () => props.record.price,
  () => {
    showPriceFlash.value = true
  }
)
watch(
  () => props.record.quantity,
  () => {
    showQuantityFlash.value = true
  }
)

function setPriceFlashOff() {
  showPriceFlash.value = false
}

function setQuantityFlashOff() {
  showQuantityFlash.value = false
}

function handleClick() {
  useEventBus(BusEvents.OrderbookPriceClick).emit(props.record.price)
}
</script>

<template>
  <div
    class="group flex text-[11px] leading-4 text-right relative text-gray-300 hover:text-white cursor-pointer select-none font-mono"
    :class="{ 'bg-brand-800': isActive }"
    @mouseenter="setIndex"
    @click="handleClick"
  >
    <div
      class="absolute hidden lg:group-hover:block left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-900 border z-20 text-white"
    >
      <div
        class="text-xs font-sans whitespace-nowrap text-left grid grid-cols-[auto_auto] gap-x-2"
      >
        <div>{{ $t('campaign.totalVolume') }}:</div>
        <div class="font-mono text-right">{{ totalVolumeToString }}</div>
        <div>{{ $t('campaign.volume') }}:</div>
        <div class="font-mono text-right">{{ volumeToString }}</div>
      </div>
    </div>

    <div
      class="absolute right-px transition-all duration-500 rounded top-px bottom-px"
      :class="{
        'bg-red-700/50': isActive && !isBuy,
        'bg-red-500/10': !isActive && !isBuy,
        'bg-green-700/60': isActive && isBuy,
        'bg-green-500/10': !isActive && isBuy
      }"
      :style="{
        width: (Number(record.totalVolume) / Number(highestVolume)) * 100 + '%'
      }"
    />

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="[
        isBuy ? 'text-green-500' : 'text-red-500',
        {
          [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
            showPriceFlash,
          'font-bold': showPriceFlash
        }
      ]"
      @animationend="setPriceFlashOff"
    >
      {{ priceToString }}
    </div>

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="{
        [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
          showQuantityFlash,
        'font-bold': showQuantityFlash
      }"
      @animationend="setQuantityFlashOff"
    >
      {{ quantityToString }}
    </div>

    <div
      :key="record.price + record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative"
    >
      {{ volumeToString }}
    </div>
  </div>

  <div class="green-300"></div>
</template>

<style>
@keyframes flash {
  0% {
    color: white;
  }

  100% {
    color: rgb(162, 162, 162);
  }
}

.flash-animation {
  animation: flash 0.2s forwards;
}

@keyframes flash-red {
  0% {
    color: rgb(248, 114, 148);
  }

  100% {
    color: rgb(243, 22, 77);
  }
}

.flash-animation-red {
  animation: flash-red 0.2s forwards;
}

@keyframes flash-green {
  0% {
    color: rgb(101, 245, 197);
  }

  100% {
    color: rgb(14, 226, 155);
  }
}

.flash-animation-green {
  animation: flash-green 0.2s forwards;
}
</style>
