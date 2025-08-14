<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getHubUrl } from '@shared/utils/network'
import { NOTIFI_LINK } from '@shared/utils/constant'
import { MainPage } from '@/types'

const jsonStore = useSharedJsonStore()

definePageMeta({
  layout: 'blank'
})

watch(
  () => jsonStore.isMaintenanceMode,
  (status) => {
    if (!status) {
      return navigateTo({ name: MainPage.Index })
    }
  },
  { immediate: true }
)

useIntervalFn(jsonStore.fetchChainUpgradeConfig, 10 * 1000, { immediate: true })
</script>

<template>
  <main
    class="min-h-screen bg-brand-900 text-white flex flex-col items-center justify-center px-4 py-16"
  >
    <div class="mb-12 flex flex-col items-center">
      <img src="/icon.png" alt="Helix" class="size-24" />
    </div>

    <h1 class="text-3xl font-semibold mb-4 text-center">
      {{ $t('maintenance.title') }}
    </h1>
    <p class="text-sm text-center">
      {{ $t('maintenance.description') }}
    </p>

    <NuxtLink
      v-if="jsonStore.chainUpgradeConfig.proposalId"
      target="_blank"
      :to="`${getHubUrl()}/proposal/${jsonStore.chainUpgradeConfig.proposalId}`"
      class="w-full max-w-2xl bg-coolGray-850 hover:bg-coolGray-800 cursor-pointer rounded-lg p-6 mb-4 flex items-center mt-20 gap-4 group"
    >
      <UIcon
        :name="NuxtUiIcons.FileOutline"
        class="text-azure-blue-700 h-7 w-7"
      />
      <div class="flex-grow">
        <h2 class="text-xl font-bold">{{ $t('maintenance.governance') }}</h2>
        <p class="text-gray-400 text-sm">
          {{ $t('maintenance.governanceDescription') }}
        </p>
      </div>

      <UIcon
        :name="NuxtUiIcons.ExternalLink"
        class="text-gray-400 group-hover:text-white h-5 w-5"
      />
    </NuxtLink>

    <NuxtLink
      :to="NOTIFI_LINK"
      target="_blank"
      class="w-full max-w-2xl bg-coolGray-850 hover:bg-coolGray-800 cursor-pointer rounded-lg p-6 mb-12 flex items-center gap-4 group"
    >
      <UIcon :name="NuxtUiIcons.Bell" class="text-azure-blue-700 h-7 w-7" />

      <div class="flex-grow">
        <h2 class="text-xl font-bold">{{ $t('maintenance.subscribe') }}</h2>
        <p class="text-gray-400 text-sm">
          {{ $t('maintenance.subscribeDescription') }}
        </p>
      </div>

      <UIcon
        :name="NuxtUiIcons.ExternalLink"
        class="text-gray-400 group-hover:text-white h-5 w-5"
      />
    </NuxtLink>

    <p class="text-center text-sm">
      {{ $t('maintenance.footer') }}
    </p>
  </main>
</template>
