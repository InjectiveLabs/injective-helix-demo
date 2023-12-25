import mixpanel, { OverridedMixpanel } from 'mixpanel-browser'
import { Wallet } from '@injectivelabs/wallet-ts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { MixPanelAnalytics } from './index'
import { MixPanelEvent, OrderAttemptStatus, TradeClickOrigin } from '@/types'
import { MIXPANEL_KEY } from '@/app/utils/constants'

export class MixPanelEvents extends MixPanelAnalytics {
  login({
    injectiveAddress,
    wallet,
    tierLevel
  }: {
    injectiveAddress: string
    wallet: Wallet
    tierLevel: number
  }) {
    this.mixpanel.identify(injectiveAddress)

    this.mixpanel.track(MixPanelEvent.Login, {
      Wallet: wallet,
      TierLevel: tierLevel,
      Address: injectiveAddress
    })

    this.mixpanel.people.increment({ Login: 1, [wallet]: 1 })
  }

  logout() {
    this.mixpanel.reset()
  }

  connectClicked() {
    this.mixpanel.track(MixPanelEvent.ConnectClicked)
  }

  swap(props: {
    fee: string
    rate: string | undefined
    inputAmount: string | undefined
    outputAmount: string | undefined
    outputToken: string | undefined
    inputToken: string | undefined
    minimumOutput: string
    slippageTolerance: string
    error?: string
    isSuccess: boolean
  }) {
    this.mixpanel.track(MixPanelEvent.Swap, props)
  }

  swapClicked() {
    this.mixpanel.track(MixPanelEvent.SwapClicked)
    this.mixpanel.people.increment('Swap Clicked')
  }

  navigateToTradePage(props: {
    market: string
    marketType: MarketType
    origin: TradeClickOrigin
  }) {
    this.mixpanel.track(MixPanelEvent.TradeClicked, props)
  }

  walletSelected(props: {
    wallet: Wallet
    userCountryFromVpnApi: string
    userCountryFromBrowser?: string
  }) {
    this.mixpanel.track(MixPanelEvent.WalletSelected, props)
  }

  surveyAccepted(surveyTitle: string) {
    this.mixpanel.track(MixPanelEvent.SurveyAccepted, { surveyTitle })
  }

  surveyRejected(surveyTitle: string) {
    this.mixpanel.track(MixPanelEvent.SurveyRejected, { surveyTitle })
  }

  placeOrderAttempt(props: {
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
    this.mixpanel.track(MixPanelEvent.PlaceOrderAttempt, props)
    this.mixpanel.people.increment('Place Order Attempts')
  }

  placeOrderConfirm(props: {
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
  }) {
    this.mixpanel.track(MixPanelEvent.PlaceOrderConfirm, props)
    this.mixpanel.people.increment('Place Order Confirms')
  }

  createStrategy(props: {
    lowerPrice: string
    upperPrice: string
    gridsNumber: string
    amountQuote: string
    amountDenom?: string
    marketPrice: string
    market: string
    isLiquidity?: boolean
  }) {
    const event = props.isLiquidity
      ? MixPanelEvent.CreateLiquidityBot
      : MixPanelEvent.CreateStrategy

    const incrementEvent = props.isLiquidity
      ? 'Create Liquidity Bot'
      : 'Create Strategies'

    this.mixpanel.track(event, { ...props, isLiquidity: undefined })
    this.mixpanel.people.increment(incrementEvent)
  }

  removeStrategy(props: {
    error?: Error
    market: string
    totalProfit: string
    duration: string
    isLiquidity?: boolean
  }) {
    const event = props.isLiquidity
      ? MixPanelEvent.RemoveLiquidityBot
      : MixPanelEvent.RemoveStrategy

    const incrementEvent = props.isLiquidity
      ? 'Remove Liquidity Bot'
      : 'Remove Strategies'

    this.mixpanel.track(event, { ...props, isLiquidity: undefined })
    this.mixpanel.people.increment(incrementEvent)
  }
}

const mixpanelNoop = {
  init: () => {},
  track: () => {},
  identify: () => {},
  reset: () => {},
  people: {
    increment: () => {}
  }
}

export const mixpanelEvents = new MixPanelEvents(
  MIXPANEL_KEY ? mixpanel : (mixpanelNoop as unknown as OverridedMixpanel)
)
