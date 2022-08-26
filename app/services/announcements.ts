import { HttpClient } from '@injectivelabs/utils'
import {
  getAnnouncementAttachmentEndpoint,
  getAnnouncementsListEndpoint
} from '../utils/helpers'

export const fetchAnnouncementsList = async () => {
  try {
    const announcementsListEndpoint = getAnnouncementsListEndpoint()
    const httpClient = new HttpClient(announcementsListEndpoint)
    const { data } = (await httpClient.get('')) as {
      data: any
    }

    return data
  } catch (e: any) {
    // silently throw error
  }
}

export const fetchAnnouncementAttachment = async (announcementId: number) => {
  try {
    const announcementAttachmentEndpoint =
      getAnnouncementAttachmentEndpoint(announcementId)
    const httpClient = new HttpClient(announcementAttachmentEndpoint)
    const { data } = (await httpClient.get('')) as {
      data: any
    }

    return data
  } catch (e: any) {
    // silently throw error
  }
}
