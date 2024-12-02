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
    background: `linear-gradient(to right, #F8F8F8 0%, #F8F8F8 ${bgLocationValue}%, #4b5563 ${bgLocationValue}%, #4b5563 100%)`
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
      class="leverage-slider-track absolute z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[5px] w-full"
      :style="sliderTrackStyle"
    />

    <span
      v-for="(leverage, index) in leverageBreakpoints"
      :key="leverage"
      :class="[
        'leverage-breakpoint absolute z-[2] border-[3px] border-solid  w-3.5 h-3.5 top-1/2 -translate-y-1/2 rotate-45 rounded-sm cursor-pointer',
        `breakpoint--${index + 1}`,
        [
          leverageAmount > leverage
            ? 'bg-coolGray-100 border-brand-900'
            : 'bg-brand-900 border-[#4b5563]'
        ]
      ]"
    />

    <span
      v-for="(leverageText, index) in leverageBreakpointTexts"
      :key="leverageText"
      :class="[
        'leverage-breakpoint-text absolute z-[2] -bottom-5 text-xs',
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
    #f8f8f8 0%,
    #f8f8f8 25%,
    #4b5563 25%,
    #4b5563 100%
  );
}

.leverage-slider::-webkit-slider-runnable-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-moz-range-track {
  @apply bg-transparent border-none pointer-events-none;
}

.leverage-slider::-webkit-slider-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-brand-900 border-[5px] border-solid border-coolGray-100 rotate-45 rounded -mt-1.5 shadow-[0_0_0_3px] shadow-brand-900;
}

.leverage-slider::-moz-range-thumb {
  @apply appearance-none w-[18px] h-[18px] bg-brand-900 border-[5px] border-solid border-coolGray-100 rotate-45 rounded -mt-1.5 shadow-[0_0_0_3px] shadow-brand-900;
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
  @apply left-[21.5%];
}

.leverage-breakpoint-text.text--2 {
  @apply left-[45%];
}

.leverage-breakpoint-text.text--3 {
  @apply left-[70.5%];
}

@screen md {
  .leverage-breakpoint.breakpoint--5 {
    @apply left-[98%];
  }

  .leverage-breakpoint-text.text--1 {
    @apply left-[23.5%];
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
