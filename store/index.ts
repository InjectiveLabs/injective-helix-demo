import { getAccessorType } from 'typed-vuex'

import * as app from '~/store/app'
import * as wallet from '~/store/wallet'
import * as spot from '~/store/spot'
import * as derivatives from '~/store/derivatives'
import * as account from '~/store/account'
import * as token from '~/store/token'
import * as bank from '~/store/bank'
import * as modal from '~/store/modal'
import * as portfolio from '~/store/portfolio'

export const accessorType = getAccessorType({
  modules: {
    app,
    modal,
    portfolio,
    account,
    bank,
    spot,
    derivatives,
    wallet,
    token
  }
})
