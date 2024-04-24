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
    <div class="text-gray-900">
      <div class="text-2xl sm:text-3xl font-semibold pb-4 sm:pb-8">
        {{ $t('home.latestNews') }}
      </div>
      <div
        v-if="announcements.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-4 lg:gap-6"
      >
        <CommonCardAnnouncement
          v-for="(announcement, index) in announcements"
          :key="`news-card-${index}`"
          class="col-span-1 xl:col-span-4 text-gray-900 h-[200px] overflow-hidden rounded-lg"
          v-bind="{ url: announcement.url }"
        >
          <template #date>{{ announcement.createdAt }}</template>
          <template #title>{{ announcement.title }}</template>
          <template v-if="announcement.featureImage" #illustration>
            <img
              :src="announcement.featureImage"
              :alt="announcement.title"
              class="object-center max-[390px]:object-contain object-cover min-[390px]:h-full md:h-fit 3xl:h-full block rounded-lg"
            />
          </template>
        </CommonCardAnnouncement>
      </div>
    </div>
  </AppHocLoading>
</template>
