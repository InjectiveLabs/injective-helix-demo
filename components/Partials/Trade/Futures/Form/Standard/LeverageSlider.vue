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
  'update:modelValue': [value: number]
  mouseup: []
}>()

const leverageBreakpointTexts = [25, 50, 75]

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
    background: `linear-gradient(to right, #40A9FF 0%, #40A9FF ${bgLocationValue}%, #181E31 ${bgLocationValue}%, #181E31 100%)`
  }
})

const leverageAmount = computed({
  get: (): number => props.modelValue,
  set: (value: number) => emit('update:modelValue', value)
})

function onMouseUp() {
  emit('mouseup')
}
</script>

<template>
  <div
    class="leverage__slider-container relative max-w-[640px] opacity-85 hover:opacity-100 transition-opacity"
  >
    <div
      class="leverage-slider-track absolute z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-full"
      :style="sliderTrackStyle"
    />

    <span
      v-for="(leverage, index) in leverageBreakpoints"
      :key="leverage"
      :class="[
        'leverage-breakpoint absolute z-[2] border-2 border-solid top-1/2 -translate-y-1/2 rotate-45 rounded-sm cursor-pointer',
        `breakpoint--${index + 1}`,
        [
          leverageAmount < leverage
            ? 'bg-coolGray-975 border-[#181E31] w-3 h-3'
            : 'bg-blue-500 border-[#181E31] w-3.5 h-3.5'
        ]
      ]"
    />

    <span
      v-for="(leverageText, index) in leverageBreakpointTexts"
      :key="leverageText"
      :class="[
        'leverage-breakpoint-text text-coolGray-450 absolute z-[2] -bottom-5 text-xs font-mono',
        `text--${index + 1}`
      ]"
    >
      {{ leverageText }}%
    </span>

    <input
      v-model="leverageAmount"
      class="leverage-slider relative z-[3] cursor-pointer appearance-none w-full h-[7px] outline-none bg-transparent"
      type="range"
      :min="minLeverage"
      :max="maxLeverage"
      :step="step"
      @mouseup="onMouseUp"
    />
  </div>
</template>

<style>
.leverage-slider-track {
  background: linear-gradient(
    to right,
    #40a9ff 0%,
    #40a9ff 25%,
    #181e31 25%,
    #181e31 100%
  );
}

.leverage-slider::-webkit-slider-runnable-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-moz-range-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-webkit-slider-thumb {
  @apply appearance-none w-[22px] h-[22px] bg-blue-500 border-2 border-solid border-coolGray-975 rotate-45 rounded -mt-1.5;
}

.leverage-slider::-moz-range-thumb {
  @apply appearance-none w-[22px] h-[22px] bg-blue-500 border-2 border-solid border-coolGray-975 rotate-45 rounded -mt-1.5;
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
  @apply left-[73%];
}

.leverage-breakpoint.breakpoint--5 {
  @apply left-[95%];
}

.leverage-breakpoint-text.text--1 {
  @apply left-[22%];
}

.leverage-breakpoint-text.text--2 {
  @apply left-[46.5%];
}

.leverage-breakpoint-text.text--3 {
  @apply left-[69%];
}

@screen md {
  .leverage-breakpoint.breakpoint--5 {
    @apply left-[98%];
  }

  .leverage-breakpoint-text.text--1 {
    @apply left-[24%];
  }

  .leverage-breakpoint-text.text--2 {
    @apply left-[48%];
  }

  .leverage-breakpoint-text.text--3 {
    @apply left-[72.5%];
  }
}

@screen lg {
  .leverage-breakpoint.breakpoint--5 {
    @apply left-[95%];
  }

  .leverage-breakpoint-text.text--1 {
    @apply left-[21.5%];
  }

  .leverage-breakpoint-text.text--2 {
    @apply left-[45%];
  }

  .leverage-breakpoint-text.text--3 {
    @apply left-[70.5%];
  }
}
</style>
