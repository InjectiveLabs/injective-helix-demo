import { Middleware, Context } from '@nuxt/types'
import { IS_MAINNET } from '~/app/utils/constants'

const earlyAccess: Middleware = ({ redirect, route }: Context) => {
  if (IS_MAINNET && route.name !== 'index') {
    // return redirect('/')
  }
}

export default earlyAccess
