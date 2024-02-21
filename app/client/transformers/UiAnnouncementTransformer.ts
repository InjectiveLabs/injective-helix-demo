import { format } from 'date-fns'
import { Announcement } from '../types/announcements'

export class UiAnnouncementTransformer {
  static convertAnnouncementToUiAnnouncement(
    announcement: Record<string, any>
  ): Announcement {
    return {
      url: announcement.url,
      title: announcement.title,
      featureImage: announcement.feature_image,
      createdAt: format(new Date(announcement.created_at), 'MMM d')
    }
  }
}
