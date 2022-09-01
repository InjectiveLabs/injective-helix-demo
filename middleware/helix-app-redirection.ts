import { Middleware, Context } from '@nuxt/types'
import { HELIX_APP_REDIRECTION } from '~/app/utils/constants'

const helixAppRedirection: Middleware = ({ redirect, route }: Context) => {
  if (HELIX_APP_REDIRECTION && route.name !== 'index') {
    return redirect('/')
  }
}

export default helixAppRedirection
