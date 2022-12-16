import { Middleware, Context } from '@nuxt/types'
import { walletConnectedRequiredRouteNames } from '~/config/routes.config'

const walletConnected: Middleware = ({ redirect, route, app }: Context) => {
  if (
    walletConnectedRequiredRouteNames.includes(route.name as string) &&
    !app.$accessor.wallet.isUserWalletConnected
  ) {
    return redirect('/')
  }
}

export default walletConnected
