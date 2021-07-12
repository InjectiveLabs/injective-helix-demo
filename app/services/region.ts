import { HttpClient } from '@injectivelabs/utils'

export const fetchRegionFromGeoIp = async (): Promise<
  { continent: string; country: string } | undefined
> => {
  const httpClient = new HttpClient('https://geoip.injective.dev/')

  try {
    const { data } = (await httpClient.get('info')) as {
      data: {
        continent: string
        country: string
      }
    }

    return data
  } catch (error) {
    return undefined
  }
}
