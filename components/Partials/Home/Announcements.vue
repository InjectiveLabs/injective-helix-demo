<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  Announcement,
  Attachment,
  AttachmentWithAnnouncement
} from '@/app/client/types/announcements'

const { $onError } = useNuxtApp()
const appStore = useAppStore()

const status = reactive(new Status(StatusType.Loading))

const attachmentsWithAnnouncements = computed(() => {
  const defaultAnnouncementsSize = 3

  if (appStore.announcements.length === 0) {
    return []
  }

  const filteredAttachments = appStore.attachments.filter(
    (attachment: Attachment) => attachment
  )

  const formattedAttachmentsWithAnnouncements = appStore.announcements.map(
    (announcement: Announcement) => {
      const matchingAttachment = filteredAttachments.find(
        (attachment: Attachment) => {
          return attachment.announcementId === announcement.announcementId
        }
      )

      if (!matchingAttachment) {
        return announcement
      }

      return {
        ...announcement,
        ...matchingAttachment
      }
    }
  )

  return formattedAttachmentsWithAnnouncements.slice(
    0,
    defaultAnnouncementsSize
  ) as AttachmentWithAnnouncement[]
})

onMounted(() => {
  Promise.all([appStore.fetchAnnouncements()])
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
        v-if="attachmentsWithAnnouncements.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-4 lg:gap-6"
      >
        <CommonCardAnnouncement
          v-for="(card, index) in attachmentsWithAnnouncements"
          :key="`news-card-${index}`"
          class="col-span-1 xl:col-span-4 text-gray-900 h-[200px] overflow-hidden"
          :html-url="card.htmlUrl"
        >
          <template #date>{{ card.createdAt }}</template>
          <template #title>{{ card.title }}</template>
          <template v-if="card.contentUrl" #illustration>
            <img
              :src="card.contentUrl"
              :alt="card.title"
              class="cover h-full block rounded-lg"
            />
          </template>
        </CommonCardAnnouncement>
      </div>
    </div>
  </AppHocLoading>
</template>
