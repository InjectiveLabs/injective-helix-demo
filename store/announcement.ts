import { defineStore } from 'pinia'
import { fetchAnnouncementsList } from '@/app/services/announcements'
import { UiAnnouncementTransformer } from '@/app/client/transformers/UiAnnouncementTransformer'
import { Announcement } from '@/app/client/types/announcements'

type AnnouncementStoreState = {
  announcements: Announcement[]
}

const initialStateFactory = (): AnnouncementStoreState => ({
  announcements: []
})

export const useAnnouncementStore = defineStore('announcement', {
  state: (): AnnouncementStoreState => initialStateFactory(),
  actions: {
    async fetchAnnouncements() {
      const announcementStore = useAnnouncementStore()

      const announcements = await fetchAnnouncementsList()

      if (
        !announcements ||
        !announcements.posts ||
        announcements.posts.length === 0
      ) {
        return
      }

      const uiAnnouncements = announcements.posts.map(
        UiAnnouncementTransformer.convertAnnouncementToUiAnnouncement
      )

      announcementStore.$patch({
        announcements: uiAnnouncements
      })
    }
  }
})
