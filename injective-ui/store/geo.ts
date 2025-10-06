import { defineStore } from 'pinia'
import { HttpRequestException } from '@injectivelabs/exceptions'
import { HttpClient } from '@injectivelabs/utils'
import {
  GOOGLE_MAPS_KEY,
  SECONDS_IN_A_DAY,
  VPN_CHECKS_ENABLED,
  PROXY_DETECTION_API_KEY
} from './../utils/constant'

type GeoStoreState = {
  ipAddress: string
  geoCountry: string
  geoContinent: string
  vpnDetected: boolean
  browserCountry: string
  vpnCheckedTimestamp: number
}

const initialStateFactory = (): GeoStoreState => ({
  vpnDetected: false,
  geoContinent: '',
  geoCountry: '',
  ipAddress: '',
  browserCountry: '',
  vpnCheckedTimestamp: 0
})

export const useSharedGeoStore = defineStore('sharedGeo', {
  state: (): GeoStoreState => initialStateFactory(),
  getters: {
    country: (state) => state.browserCountry || state.geoCountry
  },
  actions: {
    async fetchGeoLocation() {
      const sharedGeoStore = useSharedGeoStore()

      const httpClient = new HttpClient('https://geoip.injective.dev/')

      try {
        const { data } = (await httpClient.get('info')) as {
          data: {
            country: string
            continent: string
          }
        }

        sharedGeoStore.$patch({
          geoContinent: data.continent,
          geoCountry: data.country
        })
      } catch {
        // silently throw
      }
    },

    async fetchIpAddress() {
      const sharedGeoStore = useSharedGeoStore()
      const endpoint = 'https://www.myexternalip.com/json'

      try {
        const httpClient = new HttpClient(endpoint)

        const { data } = (await httpClient.get('')) as any

        sharedGeoStore.$patch({
          ipAddress: data.ip
        })
      } catch (e: unknown) {
        throw new HttpRequestException(new Error((e as any).message), {
          contextModule: 'region',
          context: endpoint
        })
      }
    },

    async fetchVPNStatus() {
      const sharedGeoStore = useSharedGeoStore()

      if (!sharedGeoStore.ipAddress) {
        await sharedGeoStore.fetchIpAddress()
      }

      const httpClient = new HttpClient('https://vpnapi.io/', { timeout: 1000 })

      try {
        const response = (await httpClient.get(
          `api/${sharedGeoStore.ipAddress}`,
          {
            key: PROXY_DETECTION_API_KEY
          }
        )) as {
          data: {
            location: {
              country_code: string
            }
            security: {
              vpn: boolean
              tor: boolean
              proxy: boolean
              relay: boolean
            }
          }
        }

        if (!response.data) {
          sharedGeoStore.$patch({
            vpnDetected: false
          })

          return
        }

        const { security } = response.data

        const vpnDetected =
          security.proxy || security.vpn || security.tor || security.relay

        sharedGeoStore.$patch({
          vpnDetected
        })
      } catch (e: unknown) {
        sharedGeoStore.$patch({
          vpnDetected: false
        })
      }
    },

    async fetchUserCountryFromBrowser() {
      const sharedGeoStore = useSharedGeoStore()

      const position = (await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      ).catch(() => {
        return {
          longitude: '',
          latitude: ''
        }
      })) as {
        coords: {
          latitude: string
          longitude: string
        }
      }

      if (position.coords.longitude === '' || position.coords.latitude === '') {
        return
      }

      const googleMapsHttpClient = new HttpClient(
        'https://maps.googleapis.com/maps/api/geocode/'
      )
      const GOOGLE_MAPS_SUFFIX = `json?latlng=${position.coords.latitude},${position.coords.longitude}&sensor=false&key=${GOOGLE_MAPS_KEY}`

      try {
        const response = (await googleMapsHttpClient.get(
          GOOGLE_MAPS_SUFFIX
        )) as {
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

        sharedGeoStore.$patch({
          browserCountry: country?.short_name || ''
        })
      } catch (e: unknown) {
        // silently throw
      }
    },

    showVpnToast(docLink?: string) {
      const sharedNotificationStore = useSharedNotificationStore()

      sharedNotificationStore.info({
        title: 'VPN or proxy detected',
        description:
          'Allow location access in browser and system settings',
        timeout: 10 * 1000,
        ...(docLink
          ? {
              actions: [
                {
                  key: docLink,
                  label: 'Learn More',
                  callback: () => window.open(docLink, '_blank')
                }
              ]
            }
          : {})
      })
    },

    async fetchVpnLocation(docLink?: string) {
      const sharedGeoStore = useSharedGeoStore()

      if (!VPN_CHECKS_ENABLED) {
        return
      }

      const todayInSeconds = Math.floor(Date.now() / 1000)

      await sharedGeoStore.fetchVPNStatus()

      if (!sharedGeoStore.vpnDetected) {
        return
      }

      const shouldCheckVpnOrProxyUsage = SECONDS_IN_A_DAY.times(7)
        .plus(sharedGeoStore.vpnCheckedTimestamp)
        .lte(todayInSeconds)

      if (!shouldCheckVpnOrProxyUsage) {
        return
      }

      sharedGeoStore.showVpnToast(docLink)
      await sharedGeoStore.fetchUserCountryFromBrowser()

      sharedGeoStore.$patch({
        vpnCheckedTimestamp: todayInSeconds
      })
    }
  }
})
