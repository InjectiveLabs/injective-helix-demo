import { Middleware, Context } from '@nuxt/types'
import { IS_MAINNET } from '~/app/utils/constants'

const leaderBoardRouteName = 'leaderboard'

const leaderBoardMiddleware: Middleware = ({ redirect, route }: Context) => {
  if (route.name === leaderBoardRouteName && IS_MAINNET) {
    return redirect('/')
  }
}

export default leaderBoardMiddleware
