import { Middleware, Context } from '@nuxt/types'

const walletConnectedRequiredRouteNames = ['portfolio']

const walletConnected: Middleware = ({ redirect, route, app }: Context) => {
  if (
    walletConnectedRequiredRouteNames.includes(route.name as string) &&
    !app.$accessor.wallet.isUserWalletConnected
  ) {
    return redirect('/')
  }
}

export default walletConnected
