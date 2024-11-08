<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
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

    <UIcon
      :name="NuxtUiIcons.Close"
      class="hover:text-white h-4 w-4 min-w-4 cursor-pointer"
      @click="closeNoticeBanner"
    />
  </div>
</template>
