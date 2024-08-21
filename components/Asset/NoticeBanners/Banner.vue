<script lang="ts" setup>
import { Banner } from '@/types'

const appStore = useAppStore()

const props = withDefaults(defineProps<{ noticeBanner: Banner }>(), {})

function closeNoticeBanner() {
  appStore.setUserState({
    ...appStore.userState,
    bannersViewed: [...appStore.userState.bannersViewed, props.noticeBanner.key]
  })
}
</script>

<template>
  <div
    class="flex justify-center items-center bg-blue-500 text-blue-900 p-1 border-b"
  >
    <p class="font-semibold text-xs md:text-md flex-1 text-center">
      {{ $t(noticeBanner.label) }}
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
