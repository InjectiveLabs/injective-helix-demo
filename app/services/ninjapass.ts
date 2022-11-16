import { HttpClient } from '@injectivelabs/utils'
import { APP_NINJA_PASS_API_ENDPOINT } from '../utils/constants'

export const fetchNinjaPassCodes = async (address: string) => {
  const httpClient = new HttpClient(APP_NINJA_PASS_API_ENDPOINT)

  try {
    const res = (await httpClient.get(`codes?address=${address}`)) as {
      data: {
        codes: { address: string; code: string }[]
      }
    }

    return res.data.codes
  } catch (e: unknown) {
    // silently fall for now
  }
}
