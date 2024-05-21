<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const { $onError } = useNuxtApp()
const announcementStore = useAnnouncementStore()

const status = reactive(new Status(StatusType.Loading))

const announcements = computed(() =>
  announcementStore.announcements.slice(0, 3)
)

onMounted(() => {
  Promise.all([announcementStore.fetchAnnouncements()])
    .catch($onError)
    .finally(() => status.setIdle())
})
</script>

<template>
  <AppHocLoading :status="status">
    <div>
      <div
        class="text-center text-2xl sm:text-3xl font-semibold pb-4 sm:pb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
      >
        {{ $t('home.latestNews') }}
      </div>
      <div v-if="announcements.length > 0" class="grid gap-8 md:grid-cols-3">
        <CommonCardAnnouncement
          v-for="(announcement, index) in announcements"
          :key="`news-card-${index}`"
          v-bind="{ url: announcement.url }"
        >
          <template #date>{{ announcement.createdAt }}</template>
          <template #title>{{ announcement.title }}</template>
          <template v-if="announcement.featureImage" #illustration>
            <img :src="announcement.featureImage" :alt="announcement.title" />
          </template>
        </CommonCardAnnouncement>
      </div>
    </div>
  </AppHocLoading>
</template>
