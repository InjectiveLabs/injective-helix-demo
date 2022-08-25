import { HttpClient } from '@injectivelabs/utils'
import {
  getAnnouncementAttachmentEndpoint,
  getAnnouncementsListEndpoint
} from '../utils/helpers'

export const fetchAnnouncementsList = async () => {
  try {
    const announcementsListEndpoint = getAnnouncementsListEndpoint()
    const httpClient = new HttpClient(announcementsListEndpoint)
    const { data } = await httpClient.get('')

    return data
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const fetchAnnouncementAttachment = async (announcementId: number) => {
  try {
    const announcementAttachmentEndpoint =
      getAnnouncementAttachmentEndpoint(announcementId)
    const httpClient = new HttpClient(announcementAttachmentEndpoint)
    const { data } = await httpClient.get('')

    return data
  } catch (e: any) {
    throw new Error(e.message)
  }
}
