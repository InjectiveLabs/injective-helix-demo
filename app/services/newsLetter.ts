import { HttpClient } from '@injectivelabs/utils'

const httpClient = new HttpClient(
  'https://www.getrevue.co/profile/chrischoitweets'
)

export const subscribeToNewsLetter = async (email: string) => {
  try {
    const { data } = (await httpClient.post('/add_subscriber'),
    {
      data: {
        email
      }
    }) as {
      data: any
    }

    return data
  } catch (e: any) {
    // silently throw error
  }
}
