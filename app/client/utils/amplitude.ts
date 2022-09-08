import {
  Identify,
  identify,
  setUserId,
  track
} from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ui-ts'
import {
  AmplitudeEvents,
  DefaultMarket,
  MarketType,
  OrderAttemptStatus,
  TradeClickOrigin
} from '~/types'
import {
  AMPLITUDE_ATTEMPT_PLACE_ORDER_COUNT,
  AMPLITUDE_CLICK_PLACE_ORDER_COUNT,
  AMPLITUDE_LOGIN_COUNT,
  AMPLITUDE_VIP_TIER_LEVEL,
  AMPLITUDE_WALLET
} from '~/app/utils/vendor'
import { HAS_AMPLITUDE_KEY } from '~/app/utils/constants'

type TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
) => void

const trackAmplitude: TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
): void => {
  if (HAS_AMPLITUDE_KEY) {
    track(args, eventProperties)
  }
}

export const submitTradeClickedTrackEvent = ({
  tierLevel,
  market,
  marketType,
  origin
}: {
  tierLevel: number
  market: DefaultMarket | string
  marketType: MarketType
  origin: TradeClickOrigin
}) => {
  const identifyObj = new Identify()
  identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, tierLevel)
  identify(identifyObj)

  trackAmplitude(AmplitudeEvents.TradeClicked, {
    market,
    marketType,
    origin
  })
}

export const submitWalletConnectClickedTrackEvent = () => {
  trackAmplitude(AmplitudeEvents.ConnectClicked)
}

export const submitWalletConnectedTrackEvent = ({
  tierLevel,
  address,
  wallet
}: {
  tierLevel: number
  address: string
  wallet: Wallet
}) => {
  setUserId(address)

  const identifyObj = new Identify()
  identifyObj.set(AMPLITUDE_WALLET, wallet)
  identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, tierLevel)
  identifyObj.add(AMPLITUDE_LOGIN_COUNT, 1)
  identify(identifyObj)

  trackAmplitude(AmplitudeEvents.Login, {
    wallet,
    address
  })
}

export const submitWalletSelectedTrackEvent = (wallet: Wallet) => {
  trackAmplitude(AmplitudeEvents.WalletSelected, {
    wallet
  })
}

export const submitClickPlaceOrderTrackEvent = ({
  tierLevel,
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
  tierLevel: number
  amount: string
  market: string
  marketType: MarketType
  orderType: SpotOrderSide | DerivativeOrderSide
  postOnly?: boolean
  tradingType: TradeExecutionType
  leverage: string
  triggerPrice: string
  reduceOnly?: boolean
  limitPrice: string
  slippageTolerance: string
}) => {
  const identifyObj = new Identify()
  identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, tierLevel)
  identifyObj.add(AMPLITUDE_CLICK_PLACE_ORDER_COUNT, 1)
  identify(identifyObj)

  trackAmplitude(AmplitudeEvents.ClickPlaceOrder, {
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

export const submitAttemptPlaceOrderTrackEvent = ({
  tierLevel,
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
  slippageTolerance,
  status,
  error
}: {
  tierLevel: number
  amount: string
  market: string
  marketType: MarketType
  orderType: SpotOrderSide | DerivativeOrderSide
  postOnly: boolean
  tradingType: TradeExecutionType
  leverage?: string
  triggerPrice?: string
  reduceOnly?: boolean
  limitPrice: string
  slippageTolerance: string
  status: OrderAttemptStatus
  error?: string
}) => {
  const identifyObj = new Identify()
  identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, tierLevel)
  identifyObj.add(AMPLITUDE_ATTEMPT_PLACE_ORDER_COUNT, 1)
  identify(identifyObj)

  trackAmplitude(AmplitudeEvents.AttemptPlaceOrder, {
    amount,
    market,
    marketType,
    orderType,
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

export const submitCosmoverseGiveawayCampaignTrackEvent = ({
  utmSource,
  utmMedium,
  utmCampaign
}: {
  utmSource: string | (string | null)[]
  utmMedium: string | (string | null)[]
  utmCampaign: string | (string | null)[]
}) => {
  trackAmplitude(AmplitudeEvents.CosmoverseGiveawayCampaign, {
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign
  })
}
