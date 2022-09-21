import { HttpClient } from '@injectivelabs/utils'
import {
  GeneralException,
  HttpRequestException
} from '@injectivelabs/exceptions'
import { restrictedCountries } from '../data/geoip'
import { GEO_IP_RESTRICTIONS_ENABLED } from '../utils/constants'
import { GeoLocation } from '~/types'

export const fetchGeoLocation = async (): Promise<GeoLocation> => {
  const httpClient = new HttpClient('https://geoip.injective.dev/')

  try {
    const { data } = (await httpClient.get('info')) as {
      data: GeoLocation
    }

    return data
  } catch (error: any) {
    return {
      country: '',
      continent: ''
    }
  }
}

export const validateGeoLocation = (geoLocation: GeoLocation) => {
  if (restrictedCountries.includes(geoLocation.country)) {
    throw new GeneralException(
      new Error('Your country is restricted from trading on this relayer')
    )
  }
}

export const fetchIpAddress = async () => {
  try {
    const httpClient = new HttpClient('https://www.myexternalip.com/json')
    const { data } = (await httpClient.get('')) as any

    return data.ip
  } catch (e: unknown) {
    throw new HttpRequestException(new Error((e as any).message), {
      contextModule: 'region'
    })
  }
}

export const validateIpAddressForVPN = async (ipAddress: string) => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.APP_PROXY_DETECTION_API_KEY}`
  }
  const httpClient = new HttpClient('https://whois.as207111.net/api').setConfig(
    { headers }
  )

  try {
    const response = (await httpClient.get('lookup', {
      ip_address: ipAddress
    })) as any

    if (!response.data) {
      return
    }

    const { privacy } = response.data

    if (privacy.proxy) {
      throw new GeneralException(
        new Error(
          'Your IP address is detected as a proxy or you are using a VPN provider.'
        )
      )
    }
  } catch (e: unknown) {
    if (e instanceof GeneralException) {
      throw e
    }

    throw new HttpRequestException(new Error((e as any).message), {
      contextModule: 'region'
    })
  }
}

export const detectVPNOrProxyUsage = async () => {
  const geoIpRestrictionsEnabled =
    !process.env.APP_PROXY_DETECTION_API_KEY || !GEO_IP_RESTRICTIONS_ENABLED

  if (geoIpRestrictionsEnabled) {
    return
  }

  try {
    await validateIpAddressForVPN(await fetchIpAddress())
  } catch (e: unknown) {
    const error = e as any

    if (error.message && error.message.startsWith('Request failed')) {
      return false /* Request failed, check next time */
    } else {
      throw new HttpRequestException(new Error((e as any).message), {
        contextModule: 'region'
      })
    }
  }
}

export const detectVPNOrProxyUsageNoThrow = async () => {
  const geoIpRestrictionsEnabled =
    !process.env.APP_PROXY_DETECTION_API_KEY || !GEO_IP_RESTRICTIONS_ENABLED

  if (geoIpRestrictionsEnabled) {
    return false
  }

  try {
    await validateIpAddressForVPN(await fetchIpAddress())

    return false /* User is not using a VPN or a proxy */
  } catch (e: unknown) {
    const error = e as any

    if (error.message && error.message.startsWith('Request failed')) {
      return false /* Request failed, check next time */
    }

    return true /* User is using a VPN or a proxy */
  }
}
