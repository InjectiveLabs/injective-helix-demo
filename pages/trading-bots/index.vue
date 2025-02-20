<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const appStore = useAppStore()
const gridStrategyStore = useGridStrategyStore()

const status = reactive(new Status(StatusType.Loading))

const { $onError } = useNuxtApp()

onMounted(() => {
  status.setLoading()

  Promise.all([gridStrategyStore.fetchStrategyStats()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <UContainer class="py-8">
    <PartialsTradingBotsHomepageHero />
    <PartialsTradingBotsHomepageMyActiveBots class="mt-10" />

    <PartialsTradingBotsHomepageMyLpRewards class="mt-10" />

    <PartialsTradingBotsHomepageShowcase
      v-if="appStore.devMode"
      class="mt-10"
    />
  </UContainer>
</template>
