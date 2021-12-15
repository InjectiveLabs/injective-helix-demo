import { getAccessorType } from 'typed-vuex'

import * as account from '~/store/account'
import * as app from '~/store/app'
import * as auction from '~/store/auction'
import * as bank from '~/store/bank'
import * as derivatives from '~/store/derivatives'
import * as dmm from '~/store/dmm'
import * as exchange from '~/store/exchange'
import * as gasRebate from '~/store/gasRebate'
import * as history from '~/store/history'
import * as modal from '~/store/modal'
import * as portfolio from '~/store/portfolio'
import * as spot from '~/store/spot'
import * as token from '~/store/token'
import * as wallet from '~/store/wallet'

export const accessorType = getAccessorType({
  modules: {
    app,
    auction,
    account,
    bank,
    derivatives,
    dmm,
    exchange,
    gasRebate,
    history,
    modal,
    portfolio,
    spot,
    token,
    wallet
  }
})
