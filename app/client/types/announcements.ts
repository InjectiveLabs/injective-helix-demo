export interface Announcement {
  announcementId: number
  htmlUrl: string
  createdAt: string
  title: string
}

export interface Attachment {
  announcementId: number
  contentUrl: string
}

export interface AttachmentWithAnnouncement extends Attachment, Announcement {}
