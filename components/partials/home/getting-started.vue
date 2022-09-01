<template>
  <div class="text-helixGray-900 sm:mb-[144px] mb-10">
    <div
      class="font-semibold text-2xl sm-text-3xl text-helixGray-900 text-left sm:text-center mt-16 sm:mt-[120px] mb-6"
    >
      {{ $t('home.getStarted') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="order-1 md:order-first md:col-span-6">
        <youtube
          ref="youtube"
          :style="{
            width: '100%',
            height: '100%',
            padding: '0 1px',
            'border-radius': '8px'
          }"
          :video-id="videoId"
        />
      </div>
      <div class="md:col-span-6 flex flex-col gap-6 font-medium">
        <div
          class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px]"
          :class="{
            'opacity-50': selectedVideoType !== VideoType.HowToBridge
          }"
          @click="switchVideo(VideoType.HowToBridge)"
        >
          <IconCircleOne
            class="ml-6"
            :class="[
              selectedVideoType === VideoType.HowToBridge
                ? 'text-blue-100'
                : 'text-gray-450'
            ]"
          />
          <span>{{ $t('home.howToBridge') }} </span>
        </div>

        <div
          class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px] md:ml-6"
          :class="{
            'opacity-50': selectedVideoType !== VideoType.HowToPlaceStopOrders
          }"
          @click="switchVideo(VideoType.HowToPlaceStopOrders)"
        >
          <IconCircleTwo
            class="ml-6"
            :class="[
              selectedVideoType === VideoType.HowToPlaceStopOrders
                ? 'text-blue-100'
                : 'text-gray-450'
            ]"
          />
          <span>{{ $t('home.howToPurchaseTokens') }} </span>
        </div>

        <div
          class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px] md:ml-12"
          :class="{
            'opacity-50': selectedVideoType !== VideoType.HowToPurchaseTokens
          }"
          @click="switchVideo(VideoType.HowToPurchaseTokens)"
        >
          <IconCircleThree
            class="ml-6"
            :class="[
              selectedVideoType === VideoType.HowToPurchaseTokens
                ? 'text-blue-100'
                : 'text-gray-450'
            ]"
          />
          <span>{{ $t('home.howToPlaceStopOrders') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

enum VideoType {
  HowToBridge = 'howToBridge',
  HowToPurchaseTokens = 'howToPurchaseTokens',
  HowToPlaceStopOrders = 'howToPlaceStopOrders'
}

const videoLinksId = {
  [VideoType.HowToBridge]: 'ohYsCATcHWI',
  [VideoType.HowToPurchaseTokens]: 'hgM6Z7YqnDk',
  [VideoType.HowToPlaceStopOrders]: 'phdJxdbLn1o'
}

export default Vue.extend({
  data() {
    return {
      VideoType,
      selectedVideoType: VideoType.HowToBridge
    }
  },

  computed: {
    videoId(): string {
      const { selectedVideoType } = this

      return videoLinksId[selectedVideoType]
    },

    youtubePlayer() {
      // @ts-ignore
      if (!this.$refs.youtube || !this.$refs.youtube.player) {
        return
      }

      // @ts-ignore
      return this.$refs.youtube.player
    }
  },

  methods: {
    switchVideo(type: VideoType) {
      this.selectedVideoType = type
      this.$nextTick(() => {
        setTimeout(() => {
          this.handlePlay()
        }, 200)
      })
    },

    handlePlay() {
      if (this.youtubePlayer) {
        this.youtubePlayer.playVideo()
      }
    }
  }
})
</script>
