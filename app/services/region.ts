import { HttpClient } from '@injectivelabs/utils'
import {
  GeneralException,
  HttpRequestException
} from '@injectivelabs/exceptions'
import { restrictedCountries } from '@/app/data/geoip'
import {
  VITE_GOOGLE_MAPS_KEY,
  PROXY_DETECTION_ENABLED,
  GEO_IP_RESTRICTIONS_ENABLED,
  VITE_PROXY_DETECTION_API_KEY
} from '@/app/utils/constants'
import { GeoLocation } from '@/types'

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

export const validateGeoLocation = (country: string) => {
  if (restrictedCountries.includes(country)) {
    throw new GeneralException(
      new Error('Helix is currently not available in your region')
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

export const validateIpAddressForVPNOld = async (ipAddress: string) => {
  const headers = {
    Accept: 'application/json'
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

export const validateIpAddressForVPN = async (ipAddress: string) => {
  const httpClient = new HttpClient('https://vpnapi.io/')

  try {
    const response = (await httpClient.get(`api/${ipAddress}`, {
      key: VITE_PROXY_DETECTION_API_KEY
    })) as {
      data: {
        security: {
          vpn: boolean
          proxy: boolean
          tor: boolean
          relay: boolean
        }
        location: {
          country_code: string
        }
      }
    }

    if (!response.data) {
      return
    }

    const { security } = response.data

    if (security.proxy || security.vpn || security.tor || security.relay) {
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
  const shouldBypassGeolocationRestrictions =
    !PROXY_DETECTION_ENABLED || !GEO_IP_RESTRICTIONS_ENABLED

  if (shouldBypassGeolocationRestrictions) {
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
  const shouldBypassGeolocationRestrictions =
    !PROXY_DETECTION_ENABLED || !GEO_IP_RESTRICTIONS_ENABLED

  if (shouldBypassGeolocationRestrictions) {
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

export const displayVPNOrProxyUsageToast = () => {
  const { info } = useNotifications()

  const MORE_INFO_URL =
    'https://helixapp.zendesk.com/hc/en-us/articles/5377904870415-Who-can-use-Helix-'
  const TOAST_DURATION = 10 * 1000

  info({
    title: 'VPN or proxy detected',
    description:
      'Please make sure that you have allowed location access in your browser and system settings.',
    timeout: TOAST_DURATION,
    actions: [
      {
        key: MORE_INFO_URL,
        label: 'Learn More',
        callback: () => window.open(MORE_INFO_URL, '_blank')
      }
    ]
  })
}

export const getCoordinatesNoThrow = async () => {
  displayVPNOrProxyUsageToast()

  const position = (await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  }).catch(() => {
    return {
      longitude: '',
      latitude: ''
    }
  })) as {
    coords: {
      longitude: string
      latitude: string
    }
  }

  return {
    longitude: position.coords.longitude,
    latitude: position.coords.latitude
  }
}

export const fetchUserCountryFromBrowser = async () => {
  const position = await getCoordinatesNoThrow()

  return await fetchCountryFromCoordinates(
    position.latitude,
    position.longitude
  )
}

export const fetchCountryFromCoordinates = async (
  latitude: string,
  longitude: string
) => {
  const googleMapsHttpClient = new HttpClient(
    'https://maps.googleapis.com/maps/api/geocode/'
  )
  const GOOGLE_MAPS_SUFFIX = `json?latlng=${latitude},${longitude}&sensor=false&key=${VITE_GOOGLE_MAPS_KEY}`

  try {
    const response = (await googleMapsHttpClient.get(GOOGLE_MAPS_SUFFIX)) as {
      data: {
        results: {
          address_components: { types: string[]; short_name: string }[]
        }[]
      }
    }

    const [results] = response.data.results

    const country = results.address_components.find((component) =>
      component.types.includes('country')
    )

    return country?.short_name || ''
  } catch (e: unknown) {
    throw new HttpRequestException(new Error((e as any).message), {
      contextModule: 'region'
    })
  }
}
