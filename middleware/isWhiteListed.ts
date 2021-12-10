import { Middleware, Context } from '@nuxt/types'
import { Modal } from '~/types'
import whiteListedAddresses from '~/whitelist.config'

const homePageRouteName = 'index'

const isWhiteListed: Middleware = ({ app, redirect, route }: Context) => {
  if (!app.$accessor.wallet.isUserWalletConnected) {
    app.$accessor.modal.openModal(Modal.Connect)

    if (route.name !== homePageRouteName) {
      return redirect('/')
    }

    return
  }

  const addressIsWhiteListed =
    whiteListedAddresses.includes(app.$accessor.wallet.address) ||
    whiteListedAddresses.includes(app.$accessor.wallet.injectiveAddress)

  if (!addressIsWhiteListed) {
    app.$accessor.modal.openModal(Modal.WhiteListOnly)

    if (route.name !== homePageRouteName) {
      return redirect('/')
    }
  }
}

export default isWhiteListed
