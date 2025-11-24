<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    step?: number
    modelValue: number
    minLeverage?: number
    maxLeverage?: number
  }>(),
  {
    step: 0.01,
    maxLeverage: 100,
    minLeverage: 0.01
  }
)

const emit = defineEmits<{
  mouseup: []
  'update:modelValue': [value: number]
}>()

const leverageBreakpoints = computed(() => {
  const { minLeverage, maxLeverage } = props
  const breakpointsList = [
    minLeverage,
    maxLeverage / 4,
    maxLeverage / 2,
    maxLeverage * (75 / 100),
    maxLeverage
  ]

  return breakpointsList
})

const sliderTrackStyle = computed(() => {
  const bgLocationValue =
    ((leverageAmount.value - props.minLeverage) /
      (props.maxLeverage - props.minLeverage)) *
    100

  return {
    background: `linear-gradient(to right, #80B5FF 0%, #80B5FF ${bgLocationValue}%, #144A74 ${bgLocationValue}%, #144A74 100%)`
  }
})

const leverageAmount = computed({
  get: (): number => props.modelValue,
  set: (value: number) => emit('update:modelValue', value)
})

function onMouseUp() {
  emit('mouseup')
}

function onChange() {
  leverageBreakpoints.value.forEach((num) => {
    const diffSnapAmount = props.maxLeverage > 10 ? 0.2 : 0.1
    const diff = Math.abs(num - leverageAmount.value)

    if (parseFloat(diff.toFixed(2)) <= diffSnapAmount) {
      emit('update:modelValue', num)
    }
  })
}
</script>

<template>
  <div
    class="leverage__slider-container relative max-w-[640px] opacity-85 hover:opacity-100 transition-opacity"
  >
    <div
      :style="sliderTrackStyle"
      class="leverage-slider-track absolute z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-full"
    />

    <span
      v-for="(leverage, index) in leverageBreakpoints"
      :key="leverage"
      :class="[
        'leverage-breakpoint absolute z-[2] border-2 border-solid top-1/2 -translate-y-1/2 rotate-45 rounded-sm cursor-pointer',
        `breakpoint--${index + 1}`,
        [
          leverageAmount < leverage
            ? 'bg-brand-900 border-[#144A74] w-3 h-3'
            : 'bg-azure-blue-350 border-brand-900 w-3.5 h-3.5'
        ]
      ]"
    />

    <input
      v-model="leverageAmount"
      type="range"
      :step="step"
      :min="minLeverage"
      :max="maxLeverage"
      class="leverage-slider relative z-[3] cursor-pointer appearance-none w-full h-[7px] outline-none bg-transparent"
      @change="onChange"
      @mouseup="onMouseUp"
    />
  </div>
</template>

<style>
.leverage-slider-track {
  background: linear-gradient(
    to right,
    #80b5ff 0%,
    #80b5ff 25%,
    #144a74 25%,
    #144a74 100%
  );
}

.leverage-slider::-webkit-slider-runnable-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-moz-range-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-webkit-slider-thumb {
  @apply appearance-none w-[22px] h-[22px] bg-azure-blue-350 border-2 border-solid border-brand-900 rotate-45 rounded -mt-1.5;
}

.leverage-slider::-moz-range-thumb {
  @apply appearance-none w-[22px] h-[22px] bg-azure-blue-350 border-2 border-solid border-brand-900 rotate-45 rounded -mt-1.5;
}

.leverage-breakpoint.breakpoint--1 {
  @apply left-0;
}

.leverage-breakpoint.breakpoint--2 {
  @apply left-[24%];
}

.leverage-breakpoint.breakpoint--3 {
  @apply left-[48.5%];
}

.leverage-breakpoint.breakpoint--4 {
  @apply left-[72.5%];
}

.leverage-breakpoint.breakpoint--5 {
  @apply left-[95%];
}
</style>
