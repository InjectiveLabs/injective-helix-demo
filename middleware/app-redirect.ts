import { Middleware, Context } from '@nuxt/types'

const appRedirect: Middleware = ({ redirect, route }: Context) => {
  if (route.name !== 'index') {
    return redirect('/')
  }
}

export default appRedirect
