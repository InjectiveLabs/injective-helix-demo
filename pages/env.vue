<script lang="ts" setup>
import { NETWORK, IS_MAINNET_STAGING } from '@shared/utils/constant'
import { gitBuild } from '@/app/json'
import { MainPage } from '@/types'

type GitLog = {
  hash: string
  date: string
  message: string
  commitLink: string
  author_name: string
}

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

const {
  tag,
  logs,
  branch,
  gitTagLink
}: { tag: string; branch: string; logs: GitLog[]; gitTagLink: string } =
  gitBuild()
</script>

<template>
  <section class="max-w-7xl mx-auto mt-12">
    <div class="flex items-center gap-2">
      <p class="font-semibold">Branch:</p>
      <p>{{ branch }}</p>
    </div>
    <div class="flex items-center gap-2">
      <p class="font-semibold">Latest tag:</p>
      <NuxtLink
        :to="gitTagLink"
        target="_blank"
        class="text-blue-500 hover:text-opacity-80"
      >
        {{ tag }}
      </NuxtLink>
    </div>

    <div class="flex items-center gap-2 mt-4">
      <p class="font-semibold">Network:</p>
      <p class="first-letter:capitalize">
        {{ NETWORK }}
        <span v-if="IS_MAINNET_STAGING">- Staging</span>
      </p>
    </div>

    <template v-if="logs.length > 0">
      <p class="font-semibold mt-4 mb-2">Commits:</p>
      <article class="rounded p-4 border border-coolGray-400">
        <div v-for="log in logs" :key="log.hash">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="log.commitLink"
              target="_blank"
              class="text-blue-500 hover:text-opacity-80"
            >
              {{ log.hash }}
            </NuxtLink>
            <span> - {{ log.message }} </span>
            <span>by {{ log.author_name }}</span>
          </div>
          <div>{{ log.date }}</div>
        </div>
      </article>
    </template>
  </section>
</template>
