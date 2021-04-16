import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { TokenWithBalance } from '~/types'

const initialState = {
  //
}

export const state = () => ({
  //
})

export type AppStoreState = ReturnType<typeof state>

export const actions = actionTree(
  { state },
  {
    async setAllowance(_, token: TokenWithBalance) {
      //
    }
  }
)
