import {
  GeneralException,
  HttpRequestException
} from '@injectivelabs/exceptions'
import { HttpClient } from '@injectivelabs/utils'
import { APP_NINJA_PASS_API_ENDPOINT } from '../utils/constants'

const httpClient = new HttpClient(APP_NINJA_PASS_API_ENDPOINT)

// TODO: Maybe move this srvice to the sdk.
export default {
  async fetchNinjaPassCodes(address: string) {
    if (!address) {
      throw new GeneralException(
        new Error('No valid INJ address was specified.')
      )
    }

    try {
      const res = (await httpClient.get(`codes?address=${address}`)) as {
        data: any
      }

      return res.data.codes
    } catch (e: unknown) {
      const response = (e as any).response

      throw new HttpRequestException(
        new Error(
          response
            ? response.data.message
            : 'Something happened, please try again later!'
        ),
        { contextModule: 'ninjapass' }
      )
    }
  }
}
