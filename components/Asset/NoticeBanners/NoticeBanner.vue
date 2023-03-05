<script setup lang="ts">
import { PropType } from 'vue'
import { NoticeBannerType } from '~~/types'

const appStore = useAppStore()

const props = defineProps({
  noticeBanner: {
    required: true,
    type: Object as PropType<NoticeBannerType>
  }
})

function closeNoticeBanner() {
  appStore.setUserState({
    ...appStore.userState,
    noticeBannersClosed: [
      ...appStore.userState.noticeBannersClosed,
      props.noticeBanner.key
    ]
  })
}
</script>

<template>
  <div
    class="flex justify-center items-center bg-blue-500 text-blue-900 p-4 border-b"
  >
    <p class="font-semibold text-sm md:text-base flex-1 text-center">
      {{ noticeBanner.label }}
      <NuxtLink
        v-if="noticeBanner.viewMore"
        class="underline"
        :to="noticeBanner.viewMoreLink"
        target="_blank"
        rel="noreferrer"
      >
        {{ noticeBanner.viewMore }}
      </NuxtLink>
    </p>
    <button
      class="text-3xl font-bold p-2 leading-[0.5]"
      @click="closeNoticeBanner"
    >
      &times;
    </button>
  </div>
</template>
