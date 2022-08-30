import { format } from 'date-fns'
import { Announcement, Attachment } from '../types/announcements'

export class UiAnnouncementTransformer {
  static convertAnnouncementToUiAnnouncement(
    announcement: Record<string, any>
  ): Announcement {
    return {
      announcementId: announcement.id,
      htmlUrl: announcement.html_url,
      createdAt: format(new Date(announcement.created_at), 'MMM d'),
      title: announcement.title
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
      announcementId: attachmentInfo.article_id,
      contentUrl: attachmentInfo.content_url
    }
  }
}
