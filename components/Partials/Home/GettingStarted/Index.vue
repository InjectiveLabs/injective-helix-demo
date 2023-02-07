<script lang="ts" setup>
enum VideoType {
  HowToBridge = 'howToBridge',
  HowToPurchaseTokens = 'howToPurchaseTokens',
  HowToPlaceStopOrders = 'howToPlaceStopOrders'
}

const videoLinksId = {
  [VideoType.HowToBridge]: 'zfhVFXT8IvQ',
  [VideoType.HowToPurchaseTokens]: 'phdJxdbLn1o',
  [VideoType.HowToPlaceStopOrders]: 'hgM6Z7YqnDk'
}

const youtube = ref()
const selectedVideoType = ref(VideoType.HowToBridge)

const videoId = computed(() => videoLinksId[selectedVideoType.value])

function switchVideo() {
  if (youtube.value?.player) {
    youtube.value.player.embed.loadVideoById(videoId.value)
    youtube.value.player.play()
  }
}
</script>

<template>
  <div class="text-gray-775 sm:mb-[144px] mb-10">
    <div
      class="font-semibold text-2xl sm-text-3xl text-gray-775 text-left sm:text-center mt-16 sm:mt-[120px] mb-6"
    >
      {{ $t('home.getStarted') }}
    </div>
    <div
      class="justify-between items-stretch gap-4 flex flex-col-reverse lg:flex-row"
    >
      <div class="video">
        <vue-plyr ref="youtube" class="h-full">
          <div
            data-plyr-provider="youtube"
            :data-plyr-embed-id="videoId"
            class="video rounded-lg"
          />
        </vue-plyr>
      </div>

      <div class="lg:col-span-6 flex flex-col gap-6 font-medium w-full">
        <PartialsHomeGettingStartedStepItem
          v-for="(step, index) in Object.values(VideoType)"
          :key="`step-${step}`"
          v-model="selectedVideoType"
          :class="{ 'lg:ml-6': index === 1, 'lg:ml-12': index === 2 }"
          :value="step"
          :step="index + 1"
          @update:modelValue="switchVideo"
        >
          <span>{{ $t(`home.${step}`) }} </span>
        </PartialsHomeGettingStartedStepItem>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video {
  @apply h-full w-full;

  aspect-ratio: 16 / 9;
}
</style>
