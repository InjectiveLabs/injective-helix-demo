import { HttpClient } from '@injectivelabs/utils'
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
    throw new Error('Your country is restricted from trading on this relayer')
  }
}

export const fetchIpAddress = async () => {
  try {
    const httpClient = new HttpClient('https://api.ipify.org/?format=json')
    const { data } = await httpClient.get('')

    return data.ip
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const validateIpAddressForVPN = async (ipAddress: string) => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.APP_PROXY_DETECTION_API_KEY}`
  }
  const httpClient = new HttpClient(
    'https://whois.as207111.net/api'
  ).setConfig({ headers })

  try {
    const response = (await httpClient.get('lookup', {
      ip_address: ipAddress
    })) as any

    if (!response.data) {
      return
    }

    const { privacy } = response.data

    if (privacy.proxy || privacy.hosting || privacy.mobile) {
      throw new Error(
        'Your IP address is detected as a proxy or you are using a VPN provider.'
      )
    }
  } catch (e: any) {
    throw new Error(e.message)
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
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const detectVPNOrProxyUsageNoThrow = async () => {
  const geoIpRestrictionsEnabled =
    !process.env.APP_PROXY_DETECTION_API_KEY || !GEO_IP_RESTRICTIONS_ENABLED

  if (geoIpRestrictionsEnabled) {
    return true
  }

  try {
    await validateIpAddressForVPN(await fetchIpAddress())
    return true
  } catch (e: any) {
    return false
  }
}
