import { HttpClient } from '@injectivelabs/utils'
import { HELIX_ENDPOINTS } from '@/app/utils/constants'

export const fetchNinjaPassCodes = async (address: string) => {
  const httpClient = new HttpClient(HELIX_ENDPOINTS.ninjaPass)

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
