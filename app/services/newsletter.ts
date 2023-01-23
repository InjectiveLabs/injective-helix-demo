import { HttpRequestException } from '@injectivelabs/exceptions'
import { HttpClient } from '@injectivelabs/utils'
import { VITE_NEWSLETTER_API } from '@/app/utils/constants'

export const subscribeToNewsletter = async (email: string) => {
  const httpClient = new HttpClient(VITE_NEWSLETTER_API)

  try {
    const response = (await httpClient.get('MailchimpHandler', {
      email
    })) as {
      data: any
    }

    return response.data
  } catch (e: unknown) {
    const response = (e as any).response

    throw new HttpRequestException(
      new Error(
        response
          ? response.data.message
          : 'Something happened, please try again later!'
      ),
      { contextModule: 'newsletter' }
    )
  }
}
