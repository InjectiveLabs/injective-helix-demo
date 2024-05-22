<script setup lang="ts">
import { OrderbookFormattedRecord } from '@/types/worker'

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
</script>

<template>
  <div
    class="group flex text-[11px] leading-4 text-right relative text-gray-300 hover:text-white cursor-pointer select-none font-mono"
    :class="{ 'bg-brand-800': isActive }"
    @mouseenter="setIndex"
  >
    <div
      class="absolute hidden group-hover:block left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-900 border z-20 text-white"
    >
      <div class="text-xs font-sans whitespace-nowrap">
        <p>
          {{ $t('campaign.totalVolume') }}:
          <span class="font-mono">{{ record.totalVolume }}</span>
        </p>
        <p>
          {{ $t('campaign.volume') }}:
          <span class="font-mono">{{ record.volume }}</span>
        </p>
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
        { 'flash-animation': showPriceFlash }
      ]"
      @animationend="setPriceFlashOff"
    >
      {{ props.record.price }}
    </div>

    <div
      :key="record.price"
      class="flex-1 min-w-0 truncate px-1 relative"
      :class="{
        [isBuy ? 'flash-animation-green' : 'flash-animation-red']:
          showQuantityFlash
      }"
      @animationend="setQuantityFlashOff"
    >
      {{ props.record.quantity }}
    </div>

    <div
      :key="record.price + record.quantity"
      class="flex-1 min-w-0 truncate px-1 relative"
    >
      {{ props.record.volume }}
    </div>
  </div>
</template>

<style>
@keyframes flash {
  0% {
    color: white;
  }
  50% {
    color: white;
  }
  100% {
    color: white;
  }
}

.flash-animation {
  animation: flash 0.2s forwards;
}

@keyframes flash-red {
  0% {
    color: rgb(243, 22, 71);
  }
  50% {
    color: rgb(243, 22, 71);
  }
  100% {
    color: rgb(243, 22, 71);
  }
}

.flash-animation-red {
  animation: flash-red 0.2s forwards;
}

@keyframes flash-green {
  0% {
    color: rgb(08, 134, 92);
  }
  50% {
    color: rgb(08, 134, 92);
  }
  100% {
    color: rgb(08, 134, 92);
  }
}

.flash-animation-green {
  animation: flash-green 0.2s forwards;
}
</style>
