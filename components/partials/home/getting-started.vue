<template>
  <div class="text-helixGray-900 sm:mb-[144px] mb-10">
    <div
      class="font-semibold text-2xl sm-text-3xl text-helixGray-900 text-left sm:text-center mt-16 sm:mt-[120px] mb-6"
    >
      {{ $t('home.getStarted') }}
    </div>
    <div class="justify-between items-stretch gap-4 flex flex-col-reverse lg:flex-row">
      <div class="w-full youtube-player">
        <youtube
          ref="youtube"
          :style="{
            width: '100%',
            padding: '0 1px',
            'border-radius': '8px',
          }"
          :video-id="videoId"
        />
      </div>
      <div class="lg:col-span-6 flex flex-col gap-6 font-medium w-full">
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
          class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px] lg:ml-6"
          :class="{
            'opacity-50': selectedVideoType !== VideoType.HowToPurchaseTokens
          }"
          @click="switchVideo(VideoType.HowToPurchaseTokens)"
        >
          <IconCircleTwo
            class="ml-6"
            :class="[
              selectedVideoType === VideoType.HowToPurchaseTokens
                ? 'text-blue-100'
                : 'text-gray-450'
            ]"
          />
          <span>{{ $t('home.howToPurchaseTokens') }} </span>
        </div>

        <div
          class="flex items-center gap-4 cursor-pointer shadow-helixLight h-[80px] lg:ml-12"
          :class="{
            'opacity-50': selectedVideoType !== VideoType.HowToPlaceStopOrders
          }"
          @click="switchVideo(VideoType.HowToPlaceStopOrders)"
        >
          <IconCircleThree
            class="ml-6"
            :class="[
              selectedVideoType === VideoType.HowToPlaceStopOrders
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
  [VideoType.HowToPurchaseTokens]: 'phdJxdbLn1o',
  [VideoType.HowToPlaceStopOrders]: 'hgM6Z7YqnDk'
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

<style lang="scss">
.youtube-player {
  iframe {
    @media (min-width: 1024px) {
      height: 100%;
    }
  }
}
</style>
