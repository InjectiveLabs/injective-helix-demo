<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    animationList: Record<string, any>
    overviewList: Record<string, any>[]
  }>(),
  {}
)
</script>

<template>
  <AppCarousel class="mt-8">
    <div v-for="item in overviewList" :key="item.type" class="embla__slide">
      <div class="embla__slide-content flex justify-center">
        <div
          class="max-w-[480px] bg-[#131620] p-6 pb-0 flex flex-col gap-6 rounded-xl"
        >
          <div class="flex flex-col items-center">
            <NuxtLink
              v-if="item.link"
              :to="item.link"
              class="flex gap-2 items-center"
            >
              <h2 class="text-2xl xs:leading-8 font-semibold">
                {{ $t(item.title) }}
              </h2>

              <UIcon class="size-4" :name="NuxtUiIcons.ChevronRight2" />
            </NuxtLink>

            <h2 v-else class="text-2xl xs:leading-8 font-semibold">
              {{ $t(item.title) }}
            </h2>

            <p class="text-lg mt-4">
              {{ $t(item.description) }}
            </p>
          </div>

          <div class="flex justify-center items-center">
            <CommonLottieAnimation
              :key="`home-${item.type}`"
              :name="animationList[item.type]"
              class="rounded-xl overflow-hidden max-w-[360px]"
            />
          </div>
        </div>
      </div>
    </div>
  </AppCarousel>
</template>
