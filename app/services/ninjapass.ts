import { HttpClient } from '@injectivelabs/utils'
import { VITE_NINJA_PASS_ENDPOINT } from '@/app/utils/constants'

export const fetchNinjaPassCodes = async (address: string) => {
  const httpClient = new HttpClient(VITE_NINJA_PASS_ENDPOINT)

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
