<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['leaderboard']
})

const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()

const tab = ref('overall')
const resolution = ref('resolution')
const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([leaderboardStore.init()])
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function fetchLeaderboard() {
  status.setLoading()

  return leaderboardStore
    .fetchLeaderboard(resolution.value)
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleTabChange(value: string) {
  tab.value = value
}

function handleResolutionChange(value: string) {
  resolution.value = value

  fetchLeaderboard()
}
</script>

<template>
  <div class="h-full w-full flex flex-wrap py-14">
    <div class="container xl:max-w-6xl">
      <div class="flex justify-between mb-10">
        <div class="flex flex-col">
          <span class="text-3xl font-bold mb-2">
            {{ $t('leaderboard.title') }}
          </span>
          <span class="text-lg">
            {{ $t('leaderboard.description') }}
          </span>
        </div>
        <div class="">
          <img class="w-full" src="/svg/leaderboard.svg" alt="leaderboard" />
        </div>
      </div>

      <PartialsLeaderboardTabMenu
        :tab="tab"
        :resolution="resolution"
        @update:tab="handleTabChange"
        @update:resolution="handleResolutionChange"
      />

      <PartialsLeaderboardTable :status="status" />
    </div>
  </div>
</template>
