<template>
  <div>
    <div class="relative mr-px">
      <!-- dots -->
      <div class="flex justify-between">
        <div
          v-for="(dot, index) in steps"
          :key="`progress-line-${dot}`"
          class="rounded-full border-2 h-4 w-4 p-px relative"
          :class="[
            dot > activeStep ? 'border-gray-500' : 'border-primary-500',
            {
              'progressing-dot':
                index + 1 === activeStep + 1 && activeStep !== steps && animate
            }
          ]"
        >
          <div
            v-if="dot <= activeStep"
            class="border-primary-500 bg-primary-500 h-full w-full rounded-full"
          />
        </div>
      </div>
      <!-- lines -->
      <div class="absolute flex justify-between items-center w-full inset-y-0">
        <div
          v-for="line in steps - 1"
          :key="`progress-line-${line}`"
          class="h-[2px] overflow-x-hidden relative"
          :class="{
            'ml-4': line === 1,
            'mr-4': line + 1 === steps,
            'bg-gradient-to-r from-primary-500 to-blue-200': line < activeStep,
            'bg-blue-200 vertical-progress-bar': line === activeStep && animate,
            'bg-gray-500': (line > activeStep && animate) || line >= activeStep
          }"
          :style="{ width: `calc((100% - ${steps} * 16px) / ${steps - 1})` }"
        >
          <span />
          <span class="left-1/4" />
          <span class="left-2/4" />
          <span class="left-3/4" />
          <span class="-left-1/4" />
        </div>
      </div>
    </div>
    <div
      v-if="stepsLabels.length > 0"
      class="flex w-full justify-between tracking-wide uppercase mt-2.5 text-xs text-gray-500"
    >
      <span
        v-for="(stepLabel, index) in stepsLabels"
        :key="`steps-label-${index}`"
        :class="{
          'text-primary-500': activeStep - 1 >= index,
          'font-semibold': activeStep - 1 === index
        }"
      >
        {{ `0${index + 1} ${stepLabel}` }}
      </span>
    </div>
    <div
      v-if="stepsNotes.length > 0"
      class="w-full mt-4 text-xs text-gray-400"
      :class="{
        'mx-auto': activeStep > 1 && activeStep <= stepsNotes.length - 1,
        'text-left': activeStep === stepsNotes.length
      }"
    >
      <p>
        {{ stepsNotes[activeStep - 1] }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    steps: {
      type: Number,
      required: true
    },

    stepsLabels: {
      type: Array,
      default: () => [],
      required: false
    },

    stepsNotes: {
      type: Array,
      default: () => [],
      required: false
    },

    activeStep: {
      type: Number,
      required: true
    },

    animate: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss">
.progressing-dot::before {
  @apply border-primary-500 border border-4 h-4 w-4 absolute rounded-full;

  content: '';
  animation: ripple 1.2s infinite;
  top: -1px;
  left: -1px;
}

.vertical-progress-bar span {
  @apply absolute w-1/4 h-full;

  background: linear-gradient(
    to right,
    theme('colors.blue.200') 0%,
    theme('colors.primary.500') 50%,
    theme('colors.blue.200') 100%
  );
  animation: loader 0.6s infinite linear;
}

@keyframes loader {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1.4, 1.4) translate(-0.5px, -0.5px);
    opacity: 0.75;
  }
  100% {
    transform: scale(2, 2) translate(-0.5px, -0.5px);
    opacity: 0;
  }
}
</style>
