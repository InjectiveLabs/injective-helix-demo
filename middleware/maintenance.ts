import { Middleware, Context } from '@nuxt/types'

const maintenanceRouteName = 'maintenance'

const maintenance: Middleware = ({ redirect, route }: Context) => {
  const maintenanceEnabled = process.env.MAINTENANCE_ENABLED === 'true'

  if (route.name !== maintenanceRouteName && maintenanceEnabled) {
    return redirect('/maintenance')
  }

  if (route.name === maintenanceRouteName && !maintenanceEnabled) {
    return redirect('/')
  }
}

export default maintenance
