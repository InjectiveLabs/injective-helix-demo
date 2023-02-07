import { format } from 'date-fns'
import { Announcement, Attachment } from '../types/announcements'

export class UiAnnouncementTransformer {
  static convertAnnouncementToUiAnnouncement(
    announcement: Record<string, any>
  ): Announcement {
    return {
      title: announcement.title,
      htmlUrl: announcement.html_url,
      announcementId: announcement.id,
      createdAt: format(new Date(announcement.created_at), 'MMM d')
    }
  }

  static convertAttachmentToUiAttachment(
    attachment: Record<string, any>
  ): Attachment | undefined {
    if (!attachment.article_attachments) {
      return
    }

    if (attachment.article_attachments.length === 0) {
      return
    }

    const [attachmentInfo] = attachment.article_attachments

    return {
      contentUrl: attachmentInfo.content_url,
      announcementId: attachmentInfo.article_id
    }
  }
}
