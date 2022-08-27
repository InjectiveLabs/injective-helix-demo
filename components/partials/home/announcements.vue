<template>
  <HocLoading :status="status">
    <div class="text-gray-900">
      <div class="text-2xl sm:text-3xl font-semibold pb-4 sm:pb-8">
        {{ $t('home.latestNews') }}
      </div>
      <div
        v-if="attachmentsWithAnnouncements.length > 0"
        class="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-4 lg:gap-6"
      >
        <AnnouncementsCard
          v-for="(card, index) in attachmentsWithAnnouncements"
          :key="`news-card-${index}`"
          class="col-span-4 text-gray-900"
          :html-url="card.htmlUrl"
        >
          <template slot="date">{{ card.createdAt }}</template>
          <template slot="title">{{ card.title }}</template>
          <template v-if="card.contentUrl" slot="illustration">
            <img
              :src="card.contentUrl"
              :alt="card.title"
              class="h-[173px] md:h-[200px] w-full"
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

      if (announcements.length === 0) {
        return []
      }

      const formattedAttachmentsWithAnnouncements = announcements.map(
        (announcement: Announcement) => {
          const matchingAttachment = attachments.find((attachment) => {
            if (!attachment) {
              return false
            }

            return attachment.announcementId === announcement.announcementId
          })

          return matchingAttachment
            ? { ...announcement, ...matchingAttachment }
            : announcement
        }
      )

      return formattedAttachmentsWithAnnouncements.slice(0, 3)
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
