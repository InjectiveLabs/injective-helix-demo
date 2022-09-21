import { HttpClient } from '@injectivelabs/utils'

const httpClient = new HttpClient(
  'https://helixapp.zendesk.com/api/v2/help_center/en-us'
)

export const fetchAnnouncementsList = async () => {
  try {
    const { data } = (await httpClient.get(
      'articles?sort_by=created_at&sort_order=desc&label_names=announcement'
    )) as {
      data: any
    }

    return data
  } catch (e: unknown) {
    // silently throw error
  }
}

export const fetchAnnouncementAttachment = async (announcementId: number) => {
  try {
    const { data } = (await httpClient.get(
      `articles/${announcementId}/attachments`
    )) as {
      data: any
    }

    return data
  } catch (e: unknown) {
    // silently throw error
  }
}
