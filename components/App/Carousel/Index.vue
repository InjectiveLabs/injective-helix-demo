<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import emblaCarouselVue from 'embla-carousel-vue'

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: false })

const props = withDefaults(
  defineProps<{
    hasDots?: boolean
    hasArrow?: boolean
    doRecalculateHeight?: boolean
  }>(),
  { hasDots: true }
)

const selectedIndex = ref(0)
const prevDisabled = ref(true)
const nextDisabled = ref(true)
const scrollSnapList = ref<number[]>([])

function onSelect() {
  prevDisabled.value = !emblaApi.value?.canScrollPrev()
  nextDisabled.value = !emblaApi.value?.canScrollNext()
  selectedIndex.value = emblaApi.value?.selectedScrollSnap() || 0
}

function scrollPrev() {
  emblaApi.value?.scrollPrev()
}

function scrollNext() {
  emblaApi.value?.scrollNext()
}

function scrollTo(index: number) {
  emblaApi.value?.scrollTo(index)
}

function adjustHeight() {
  setTimeout(() => {
    if (!emblaRef.value) {
      return
    }

    const slideList = emblaRef.value.querySelectorAll('.embla__slide-content')

    if (slideList?.length) {
      const height = (slideList[selectedIndex.value] as HTMLElement)
        .offsetHeight

      emblaRef.value.style.height = `${height}px`
    }
  }, 100)
}

watch(
  () => props.doRecalculateHeight,
  (newVal) => {
    if (newVal) {
      adjustHeight()
    }
  }
)

onMounted(() => {
  if (!emblaApi.value) {
    return
  }

  emblaApi.value.on('init', () => {
    onSelect()
    scrollSnapList.value = emblaApi.value?.scrollSnapList() || []
  })

  emblaApi.value.on('reInit', () => {
    onSelect()
    adjustHeight()
    scrollSnapList.value = emblaApi.value?.scrollSnapList() || []
  })

  emblaApi.value.on('select', () => {
    onSelect()
    adjustHeight()
  })
})
</script>

<template>
  <div>
    <div ref="emblaRef" class="embla">
      <div class="embla__container">
        <slot />
      </div>
    </div>

    <div v-if="hasDots" class="embla__dots flex justify-center gap-2 mt-6">
      <AppCarouselDot
        v-for="(item, index) in scrollSnapList"
        :key="index"
        v-bind="{ index, selectedIndex }"
        @dot:click="scrollTo"
      />
    </div>

    <div v-else-if="hasArrow" class="flex justify-center gap-4 mt-6">
      <slot name="left-arrow" v-bind="{ prevDisabled, scrollPrev }">
        <UIcon
          class="size-5"
          :name="NuxtUiIcons.ChevronLeft2"
          :class="{ 'opacity-30 pointer-events-none': prevDisabled }"
          @click="scrollPrev"
        />
      </slot>

      <slot name="next-arrow" v-bind="{ nextDisabled, scrollNext }">
        <UIcon
          class="size-5"
          :name="NuxtUiIcons.ChevronRight2"
          :class="{ 'opacity-30 pointer-events-none': nextDisabled }"
          @click="scrollNext"
        />
      </slot>
    </div>
  </div>
</template>

<style>
.embla {
  overflow: hidden;
}

.embla__container {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  gap: 1rem;
}

.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}

.embla__dot {
  @apply size-2 rounded-full bg-coolGray-500;
}

.embla__dot--selected {
  @apply bg-white;
}
</style>
