<template>
  <HocLoading :status="status">
    <div class="text-gray-900">
      <div class="text-2xl sm:text-3xl font-semibold pb-4 sm:pb-8">
        {{ $t('home.latestNews') }}
      </div>
      <div
        v-if="attachmentsWithAnnouncements.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-4 lg:gap-6"
      >
        <AnnouncementsCard
          v-for="(card, index) in attachmentsWithAnnouncements"
          :key="`news-card-${index}`"
          class="col-span-1 xl:col-span-4 text-gray-900 h-[200px] overflow-hidden"
          :html-url="card.htmlUrl"
        >
          <template slot="date">{{ card.createdAt }}</template>
          <template slot="title">{{ card.title }}</template>
          <template v-if="card.contentUrl" slot="illustration">
            <img
              :src="card.contentUrl"
              :alt="card.title"
              class="cover h-full block rounded-lg"
            />
          </template>
        </AnnouncementsCard>
      </div>
    </div>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { Announcement, Attachment } from '~/app/client/types/announcements'

export default Vue.extend({
  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    announcements(): Array<Announcement> {
      return this.$accessor.app.announcements
    },

    attachments(): Array<Attachment> {
      return this.$accessor.app.attachments
    },

    attachmentsWithAnnouncements(): Array<
      Announcement | (Attachment & Announcement)
    > {
      const { announcements, attachments } = this
      const defaultAnnouncementsSize = 3

      if (announcements.length === 0) {
        return []
      }

      const filteredAttachments = attachments.filter((attachment) => attachment)
      const formattedAttachmentsWithAnnouncements = announcements.map(
        (announcement: Announcement) => {
          const matchingAttachment = filteredAttachments.find((attachment) => {
            return attachment.announcementId === announcement.announcementId
          })

          if (!matchingAttachment) {
            return announcement
          }

          return { ...announcement, ...matchingAttachment }
        }
      )

      return formattedAttachmentsWithAnnouncements.slice(
        0,
        defaultAnnouncementsSize
      )
    }
  },

  mounted() {
    Promise.all([this.$accessor.app.fetchAnnouncements()])
      .then(() => {})
      .catch(this.$onError)
      .finally(() => this.status.setIdle())
  }
})
</script>
