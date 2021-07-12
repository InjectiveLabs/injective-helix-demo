import { Middleware, Context } from '@nuxt/types'
import { fetchRegionFromGeoIp } from '~/app/services/region'

const geoIpRestrictionsRouteName = 'forbidden'
const listOfForbiddenCountries = ['US']

const geoIpRestrictions: Middleware = async ({ redirect, route }: Context) => {
  const geoIpRestrictionsEnabled =
    process.env.GEO_IP_RESTRICTIONS_ENABLED === 'true'

  if (geoIpRestrictionsEnabled && route.name !== geoIpRestrictionsRouteName) {
    const region = await fetchRegionFromGeoIp()

    if (region) {
      const { country } = region

      if (listOfForbiddenCountries.includes(country)) {
        return redirect('/forbidden')
      }
    }
  }

  if (route.name === geoIpRestrictionsRouteName && !geoIpRestrictionsEnabled) {
    return redirect('/')
  }
}

export default geoIpRestrictions
