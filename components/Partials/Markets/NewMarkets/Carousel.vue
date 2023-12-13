<script lang="ts" setup>
import { ref } from 'vue'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const MINIMUM_MARKETS = 3

const animationClass = ref('slide-fade-right')

const currentMarketsBatch = ref(0)

const totalMarketsBatches = computed(() => {
  const fullBatches = Math.floor(props.markets.length / MINIMUM_MARKETS)
  const hasRemainder = props.markets.length % MINIMUM_MARKETS !== 0

  return fullBatches + (hasRemainder ? 1 : 0)
})

const displayedMarkets = computed(() => {
  const batchStart = currentMarketsBatch.value * MINIMUM_MARKETS
  const itemsToDisplay = Math.min(MINIMUM_MARKETS, props.markets.length)
  const rotatedMarkets = [
    ...props.markets.slice(batchStart),
    ...props.markets.slice(0, batchStart)
  ]

  return rotatedMarkets.slice(0, itemsToDisplay)
})

function goToNext() {
  if (isActive.value) {
    pause()
  }

  const isLastBatch =
    currentMarketsBatch.value === totalMarketsBatches.value - 1

  if (isLastBatch) {
    return
  }

  animationClass.value = 'slide-fade-right'

  const nextBatch = currentMarketsBatch.value + 1

  currentMarketsBatch.value = nextBatch % totalMarketsBatches.value
}

function goToPrevious() {
  if (isActive.value) {
    pause()
  }

  if (currentMarketsBatch.value === 0) {
    return
  }

  animationClass.value = 'slide-fade-left'

  currentMarketsBatch.value -= 1
}

function onClickIndicator(index: number) {
  if (isActive.value) {
    pause()
  }

  if (currentMarketsBatch.value === index) {
    return
  }

  if (currentMarketsBatch.value < index) {
    animationClass.value = 'slide-fade-right'
  } else {
    animationClass.value = 'slide-fade-left'
  }

  currentMarketsBatch.value = index
}

const { pause, isActive } = useIntervalFn(() => {
  const nextBatch = currentMarketsBatch.value + 1

  currentMarketsBatch.value = nextBatch % totalMarketsBatches.value
}, 7000)
</script>

<template>
  <div>
    <ClientOnly>
      <Teleport to="#new-markets-navigate">
        <div v-if="markets.length > MINIMUM_MARKETS" class="flex gap-2">
          <div
            class="w-8 h-8 flex items-center justify-center rounded-[20px] bg-gray-750 bg-opacity-30"
            :class="{ 'opacity-20': currentMarketsBatch === 0 }"
            @click="goToPrevious"
          >
            <BaseIcon name="caret-thin" class="h-4 w-4 text-white" />
          </div>

          <div
            class="w-8 h-8 flex items-center justify-center rounded-[20px] bg-gray-750 bg-opacity-30"
            :class="{
              'opacity-20': currentMarketsBatch === totalMarketsBatches - 1
            }"
            @click="goToNext"
          >
            <BaseIcon name="caret-thin" class="h-4 w-4 rotate-180 text-white" />
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <div class="relative overflow-hidden">
      <Transition mode="default" :name="animationClass">
        <div :key="currentMarketsBatch" class="md:grid grid-cols-12 gap-6">
          <PartialsMarketsCard
            v-for="(newMarket, index) in displayedMarkets"
            :key="`${newMarket.market.marketId}-${currentMarketsBatch}-${index}`"
            class="flex-0-full col-span-4"
            data-cy="market-card-whats-new"
            v-bind="{
              market: newMarket.market,
              summary: newMarket.summary,
              volumeInUsd: newMarket.volumeInUsd
            }"
          />
        </div>
      </Transition>
    </div>

    <div
      v-if="markets.length > MINIMUM_MARKETS"
      class="flex gap-2 justify-center mt-4"
    >
      <AppHorizontalScrollViewIndicator
        v-for="index in totalMarketsBatches"
        :key="`horizontal-scroll-view-indicator-${index}`"
        :is-active="currentMarketsBatch === index - 1"
        @click="onClickIndicator(index - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.slide-fade-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-right-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-right-leave-active {
  /* display: none; */
  position: absolute;
  width: 100%;
  transition: all 0.3s ease;
}
.slide-fade-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-fade-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-fade-left-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-left-leave-active {
  /* display: none; */
  position: absolute;
  width: 100%;
  transition: all 0.3s ease;
}

.slide-fade-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
