import { Middleware, Context } from '@nuxt/types'

const helixAppRedirection: Middleware = ({ redirect, route }: Context) => {
  if (route.name !== 'index') {
    return redirect('/')
  }
}

export default helixAppRedirection
