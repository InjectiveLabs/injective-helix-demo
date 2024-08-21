<script lang="ts" setup>
import { differenceInSeconds } from 'date-fns'
import { GuildCampaignSummary } from '@injectivelabs/sdk-ts'
import { formatSecondsToDisplay } from '@/app/utils/formatters'
import { TimeDuration } from '@/types'

const props = withDefaults(
  defineProps<{
    now: number
    summary: GuildCampaignSummary
  }>(),
  {}
)

const delayAnimationMs = ref(0)
const blockToAnimate = ref<string[]>([])
const isCampaignOver = computed(() => props.summary.endTime < props.now)
const isCampaignStarted = computed(() => props.summary.startTime > props.now)

const countdown = computed(() => {
  if (isCampaignOver.value) {
    return {
      [TimeDuration.Day]: '00',
      [TimeDuration.Hour]: '00',
      [TimeDuration.Minute]: '00',
      [TimeDuration.Second]: '00'
    }
  }

  const end = isCampaignStarted.value
    ? props.summary.startTime
    : props.summary.endTime

  const diffInSeconds = differenceInSeconds(end, props.now)
  const duration = formatSecondsToDisplay({ value: diffInSeconds })

  if (!duration) {
    return
  }

  return Object.entries(duration).reduce(
    (display, [key, value]) => {
      if (value === 0) {
        return { ...display, [key]: '00' }
      }

      return { ...display, [key]: value < 10 ? `0${value}` : `${value}` }
    },
    {} as Record<TimeDuration, number>
  )
})

watch(countdown, (oldVal, newVal) => {
  if (!oldVal || !newVal) {
    return
  }

  // ensure that animation starts on full second
  delayAnimationMs.value = props.now % 1000

  blockToAnimate.value = Object.keys(newVal)
    .reduce((list, key) => {
      const durationKey = key as TimeDuration

      if (oldVal[durationKey] !== newVal[durationKey]) {
        list = [...list, `${key}`]
      }

      return list
    }, [] as string[])
    .reverse()
})
</script>

<template>
  <section v-if="countdown" class="text-center">
    <h3 class="text-2xl font-semibold">
      <span v-if="isCampaignOver">{{ $t('guild.seasonOneEnded') }}</span>
      <span v-else-if="isCampaignStarted">{{ $t('guild.startsIn') }}</span>
      <span v-else>{{ $t('guild.endsIn') }}</span>
    </h3>
    <div
      v-if="!isCampaignOver"
      class="my-4 flex items-center justify-around max-w-[300px] min-h-[66px] mx-auto"
    >
      <div
        v-for="([label, value], index) in Object.entries(countdown)"
        :key="`guilds-countdown-${label}`"
        class="flex"
      >
        <div class="flex flex-col items-center justify-center gap-1">
          <h1
            class="text-5xl font-semibold min-w-[60px]"
            :class="[
              { 'animate-duration': blockToAnimate.includes(label) },
              `delay-[${delayAnimationMs}ms]`
            ]"
          >
            {{ value }}
          </h1>
          <span class="text-sm capitalize">
            {{ $t(`common.${label}`) }}
          </span>
        </div>
        <span
          v-if="index + 1 !== Object.entries(countdown).length"
          class="text-5xl font-semibold -mt-1 mx-1"
        >
          :
        </span>
      </div>
    </div>
  </section>
</template>

<style>
.animate-duration {
  animation: rotateIn 1s linear infinite;
  animation-fill-mode: forwards;
}

@keyframes rotateIn {
  0% {
    opacity: 0;
    transform: translateY(20%);
  }

  50% {
    transform: translateY(0);
    opacity: 1;
  }

  /* 100% {
    transform: translateY(0);
    opacity: 1;
  } */
}
</style>
