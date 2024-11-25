<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { NoticeBanner, LeaderboardSubPage } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const isBannerVisible = ref(true)

function hideBanner() {
  isBannerVisible.value = false

  appStore.setUserState({
    ...appStore.userState,
    bannersViewed: [
      ...appStore.userState.bannersViewed,
      NoticeBanner.TeslaCampaign
    ]
  })
}
</script>

<template>
  <div
    v-if="
      isBannerVisible &&
      !appStore?.userState?.bannersViewed.includes(
        NoticeBanner.TeslaCampaign
      ) &&
      route.name !== LeaderboardSubPage.Competition
    "
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm justify-between relative z-40"
  >
    <div />

    <div class="flex items-center space-x-2">
      <i18n-t keypath="leaderboard.competition.teslaBanner.top" tag="p">
        <template #linkDescription>
          <NuxtLink
            class="inline-flex font-semibold"
            :to="{ name: LeaderboardSubPage.Competition }"
          >
            {{ $t('leaderboard.competition.teslaBanner.linkDescription') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </div>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="hideBanner"
    />
  </div>
</template>
