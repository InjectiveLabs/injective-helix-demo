import { defineStore } from 'pinia'
import {
  fetchAnnouncementsList,
  fetchAnnouncementAttachment
} from '@/app/services/announcements'
import { UiAnnouncementTransformer } from '@/app/client/transformers/UiAnnouncementTransformer'
import { Announcement, Attachment } from '@/app/client/types/announcements'

type AnnouncementStoreState = {
  announcements: Announcement[]
  attachments: Attachment[]
}

const initialStateFactory = (): AnnouncementStoreState => ({
  announcements: [],
  attachments: []
})

export const useAnnouncementStore = defineStore('announcement', {
  state: (): AnnouncementStoreState => initialStateFactory(),
  actions: {
    async fetchAnnouncements() {
      const announcementStore = useAnnouncementStore()

      const announcements = await fetchAnnouncementsList()

      if (
        !announcements ||
        !announcements.articles ||
        announcements.articles.length === 0
      ) {
        return
      }

      const uiAnnouncements = announcements.articles.map(
        UiAnnouncementTransformer.convertAnnouncementToUiAnnouncement
      )

      announcementStore.$patch({
        announcements: uiAnnouncements
      })

      await announcementStore.fetchAttachments()
    },

    async fetchAttachments() {
      const announcementStore = useAnnouncementStore()

      if (announcementStore.announcements.length === 0) {
        return
      }

      const attachments = await Promise.all(
        announcementStore.announcements.map(
          ({ announcementId }: { announcementId: number }) =>
            fetchAnnouncementAttachment(announcementId)
        )
      )

      if (!attachments || attachments.length === 0) {
        return
      }

      const uiAttachments = attachments.map(
        UiAnnouncementTransformer.convertAttachmentToUiAttachment
      ) as Attachment[]

      announcementStore.$patch({
        attachments: uiAttachments
      })
    }
  }
})
