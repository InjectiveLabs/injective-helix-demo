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
    class="flex justify-center items-center bg-blue-500 text-blue-900 px-3 py-2 border-b"
  >
    <p class="font-semibold text-sm md:text-md flex-1 text-center">
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

    <SharedIcon
      name="close"
      class="hover:text-white"
      is-md
      @click="closeNoticeBanner"
    />
  </div>
</template>
