import { getAccessorType } from 'typed-vuex'

import * as account from '~/store/account'
import * as app from '~/store/app'
import * as auction from '~/store/auction'
import * as bank from '~/store/bank'
import * as bridge from '~/store/bridge'
import * as derivatives from '~/store/derivatives'
import * as exchange from '~/store/exchange'
import * as activity from '~/store/activity'
import * as gasRebate from '~/store/gasRebate'
import * as onboard from '~/store/onboard'
import * as modal from '~/store/modal'
import * as spot from '~/store/spot'
import * as referral from '~/store/referral'
import * as positions from '~/store/positions'
import * as token from '~/store/token'
import * as wallet from '~/store/wallet'
import * as params from '~/store/params'

export const accessorType = getAccessorType({
  modules: {
    app,
    auction,
    account,
    bank,
    bridge,
    derivatives,
    onboard,
    exchange,
    gasRebate,
    modal,
    activity,
    referral,
    positions,
    spot,
    token,
    wallet,
    params
  }
})
