<script setup lang="ts">
import { Modal, LeaderboardSubPage, MainPage } from '@/types'

definePageMeta({
  middleware: [
    () => {
      const appStore = useAppStore()

      if (!appStore.devMode) {
        return navigateTo({ name: MainPage.Index })
      }
    }
  ]
})

const route = useRoute()
const appStore = useAppStore()
const modalStore = useModalStore()

function onNavigate() {
  if (route.name !== LeaderboardSubPage.Pnl) {
    return
  }

  if (appStore.userState.modalsViewed.includes(Modal.LeaderboardTerms)) {
    return
  }

  modalStore.openModal(Modal.LeaderboardTerms)

  return navigateTo({ name: LeaderboardSubPage.Pnl })
}
</script>

<template>
  <div class="relative">
    <div
      class="bg-[url('/images/leaderboard/pnl-bg.webp')] h-[1155px] w-full bg-center bg-contain -top-[100px] opacity-70 absolute"
    />

    <div class="container lg:px-[120px] mx-auto text-center relative">
      <section class="flex flex-col space-y-2 pt-12 pb-7 md:py-40">
        <div class="uppercase font-rubik font-black text-3xl md:text-6xl">
          {{ $t('leaderboard.title') }}
        </div>
        <div class="max-sm:text-xs">
          {{ $t('leaderboard.description') }}
        </div>
      </section>

      <section class="h-flex-full">
        <div
          class="flex flex-col md:flex-row max-md:space-y-4 justify-between mb-6 md:mb-10"
        >
          <div class="max-md:text-left">
            <NuxtLink
              v-for="pageName in Object.values(LeaderboardSubPage)"
              :key="pageName"
              v-bind="{ value: pageName }"
              class="capitalize max-md:mr-4 md:px-4 py-2 text-sm md:text-lg font-semibold border-b whitespace-nowrap leading-6"
              :class="{
                'text-gray-200': route.name !== pageName,
                'border-blue-500 text-blue-500': route.name === pageName
              }"
              :to="{
                name: pageName
              }"
              @click.prevent="onNavigate"
            >
              {{ $t(`leaderboard.tabs.${pageName}`) }}
            </NuxtLink>
          </div>

          <div id="campaign-time-left" />
        </div>

        <NuxtPage
          :transition="{
            name: 'fade',
            mode: 'out-in'
          }"
        />
      </section>
    </div>

    <ModalsLeaderboardTerms />
  </div>
</template>
