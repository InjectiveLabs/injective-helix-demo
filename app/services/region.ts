import { HttpClient } from '@injectivelabs/utils'
import { restrictedCountries } from '../data/geoip'
import { GeoLocation } from '~/types'

export const fetchGeoLocation = async (): Promise<GeoLocation | undefined> => {
  const httpClient = new HttpClient('https://geoip.injective.dev/')

  try {
    const { data } = (await httpClient.get('info')) as {
      data: GeoLocation
    }

    return data
  } catch (error) {
    return undefined
  }
}

export const validateGeoLocation = (geoLocation: GeoLocation) => {
  if (restrictedCountries.includes(geoLocation.country)) {
    throw new Error(`Your country is restricted from trading on this relayer`)
  }
}
