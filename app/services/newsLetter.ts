import { HttpClient } from '@injectivelabs/utils'
import { APP_NEWSLETTER_API } from '../utils/constants'

export const subscribeToNewsLetter = async (email: string) => {
  const httpClient = new HttpClient(APP_NEWSLETTER_API)

  try {
    const response = (await httpClient.get('MailchimpHandler', {
      email
    })) as {
      data: any
    }

    return response.data
  } catch (e: any) {
    throw new Error(e)
  }
}
