import {
  track,
  Identify,
  setUserId,
  identify as amplitudeIdentify
} from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  AMPLITUDE_WALLET,
  AMPLITUDE_LOGIN_COUNT,
  AMPLITUDE_VIP_TIER_LEVEL,
  AMPLITUDE_TRANSFERS_MADE_COUNT,
  AMPLITUDE_CLICK_PLACE_ORDER_COUNT,
  AMPLITUDE_ATTEMPT_PLACE_ORDER_COUNT
} from '@/app/utils/vendor'
import { AMPLITUDE_KEY } from '@/app/utils/constants'
import { localStorage } from '@/app/Services'
import {
  AmplitudeEvent,
  TradeClickOrigin,
  TransferDirection,
  OrderAttemptStatus,
  TradeExecutionType
} from '@/types'

type TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
) => void

export const trackAmplitude: TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
): void => {
  if (AMPLITUDE_KEY) {
    track(args, eventProperties)
  }
}

export interface AmplitudeTrackerUser {
  tierLevel: number
  address: string
  wallet: Wallet
}

export class AmplitudeTracker {
  private user?: AmplitudeTrackerUser

  constructor(user?: AmplitudeTrackerUser) {
    this.user = user || this.getUserLocalStorage()
  }

  setUser(user: AmplitudeTrackerUser) {
    this.user = user
    setUserId(user.address)
    this.setUserLocalStorage(user)
  }

  getUser(): AmplitudeTrackerUser | undefined {
    return this.user
  }

  setUserLocalStorage(user: AmplitudeTrackerUser) {
    localStorage.set('amplitudeUser', user)
  }

  getUserLocalStorage(): AmplitudeTrackerUser | undefined {
    return localStorage.get('amplitudeUser') as unknown as
      | AmplitudeTrackerUser
      | undefined
  }

  getIdentify(): Identify {
    const { user } = this
    const identify = new Identify()

    if (!user) {
      return identify
    }

    identify.set(AMPLITUDE_WALLET, user.wallet)
    identify.set(AMPLITUDE_VIP_TIER_LEVEL, user.tierLevel)

    return identify
  }

  submitWalletConnectedTrackEvent() {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_LOGIN_COUNT, 1)
    amplitudeIdentify(identify)

    trackAmplitude(AmplitudeEvent.Login, {
      wallet: user.wallet,
      address: user.address
    })
  }

  submitWalletSelectedTrackEvent(wallet: Wallet) {
    trackAmplitude(AmplitudeEvent.WalletSelected, {
      wallet
    })
  }

  submitTradeClickedTrackEvent({
    market,
    marketType,
    origin
  }: {
    market: string
    marketType: MarketType
    origin: TradeClickOrigin
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    amplitudeIdentify(identify)

    trackAmplitude(AmplitudeEvent.TradeClicked, {
      market,
      marketType,
      origin
    })
  }

  submitClickPlaceOrderTrackEvent({
    amount,
    market,
    marketType,
    orderType,
    postOnly,
    tradingType,
    leverage,
    triggerPrice,
    reduceOnly,
    limitPrice,
    slippageTolerance
  }: {
    amount: string
    market: string
    marketType: MarketType
    orderType: OrderSide
    postOnly?: boolean
    tradingType: TradeExecutionType
    leverage: string
    triggerPrice: string
    reduceOnly?: boolean
    limitPrice: string
    slippageTolerance: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_CLICK_PLACE_ORDER_COUNT, 1)
    amplitudeIdentify(identify)

    trackAmplitude(AmplitudeEvent.ClickPlaceOrder, {
      amount,
      market,
      marketType,
      orderType,
      postOnly,
      tradingType,
      leverage,
      triggerPrice,
      reduceOnly,
      limitPrice,
      slippageTolerance
    })
  }

  submitAttemptPlaceOrderTrackEvent({
    amount,
    market,
    marketType,
    orderSide,
    postOnly,
    tradingType,
    leverage,
    triggerPrice,
    reduceOnly,
    limitPrice,
    slippageTolerance,
    status,
    error
  }: {
    amount: string
    market: string
    marketType: MarketType
    orderSide: OrderSide
    postOnly: boolean
    tradingType: TradeExecutionType
    leverage?: string
    triggerPrice?: string
    reduceOnly?: boolean
    limitPrice: string
    slippageTolerance: string
    status: OrderAttemptStatus
    error?: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_ATTEMPT_PLACE_ORDER_COUNT, 1)
    amplitudeIdentify(identify)

    trackAmplitude(AmplitudeEvent.AttemptPlaceOrder, {
      amount,
      market,
      marketType,
      orderSide,
      postOnly,
      tradingType,
      triggerPrice,
      leverage,
      limitPrice,
      reduceOnly,
      slippageTolerance,
      status,
      error
    })
  }

  transferTradingAccountTrack({
    transferDirection,
    token,
    amount
  }: {
    transferDirection: TransferDirection
    token: string
    amount: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_TRANSFERS_MADE_COUNT, 1)
    amplitudeIdentify(identify)

    trackAmplitude(AmplitudeEvent.Transfer, {
      transferDirection,
      token,
      amount
    })
  }

  trackEvent(event: AmplitudeEvent, eventProperties?: Record<string, any>) {
    const { user } = this
    const identify = this.getIdentify()

    if (user || identify) {
      amplitudeIdentify(identify)
    }

    trackAmplitude(event, eventProperties)
  }
}

export const amplitudeTracker = new AmplitudeTracker()
