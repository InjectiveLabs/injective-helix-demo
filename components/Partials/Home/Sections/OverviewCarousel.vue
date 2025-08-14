<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    animationList: Record<string, any>
    overviewList: Record<string, any>[]
  }>(),
  {}
)

const isFirstAnimationReady = ref(false)

function onAnimationReady(lottieKey: string) {
  isFirstAnimationReady.value = lottieKey === props.overviewList[0].type
}
</script>

<template>
  <AppCarousel
    class="mt-8"
    v-bind="{ doRecalculateHeight: isFirstAnimationReady }"
  >
    <div v-for="item in overviewList" :key="item.type" class="embla__slide">
      <div class="embla__slide-content flex justify-center">
        <div
          class="max-w-[480px] bg-[#141620] p-6 pb-0 flex flex-col gap-6 rounded-xl"
        >
          <div class="flex flex-col items-center">
            <NuxtLink v-if="item.link" :to="item.link">
              <h2 class="text-2xl font-semibold">
                <span class="mr-2">{{ $t(item.title) }}</span>
                <UIcon
                  class="size-6 align-middle"
                  :name="NuxtUiIcons.ExternalLink2"
                />
              </h2>
            </NuxtLink>

            <h2 v-else class="text-2xl font-semibold">
              {{ $t(item.title) }}
            </h2>

            <p class="text-lg mt-4">
              {{ $t(item.description) }}
            </p>
          </div>

          <div class="flex justify-center items-center">
            <CommonLottieAnimation
              :key="`home-${item.type}`"
              v-bind="{
                lottieKey: item.type,
                name: animationList[item.type]
              }"
              class="rounded-xl overflow-hidden max-w-[360px]"
              @animation:ready="onAnimationReady"
            />
          </div>
        </div>
      </div>
    </div>
  </AppCarousel>
</template>
