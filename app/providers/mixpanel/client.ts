import mixpanel, { OverridedMixpanel } from 'mixpanel-browser'
import { Wallet } from '@injectivelabs/wallet-ts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { MIXPANEL_KEY } from '../../constants/setup'
import { MixPanelEvent, OrderAttemptStatus, TradeClickOrigin } from '@/types'

export class MixPanelAnalytics {
  mixpanelClient: OverridedMixpanel | undefined

  mixpanelKey: string

  constructor(mixpanelKey: string) {
    this.mixpanelKey = mixpanelKey
    this.mixpanelClient = undefined
  }

  trackLogin({
    injectiveAddress,
    wallet,
    tierLevel
  }: {
    injectiveAddress: string
    wallet: Wallet
    tierLevel: number
  }) {
    this.getMixpanelClient().identify(injectiveAddress)

    this.getMixpanelClient().track(MixPanelEvent.Login, {
      Wallet: wallet,
      TierLevel: tierLevel,
      Address: injectiveAddress
    })

    this.getMixpanelClient().people.increment({ Login: 1, [wallet]: 1 })
  }

  trackLogout() {
    this.getMixpanelClient().reset()
  }

  trackConnectClicked() {
    this.getMixpanelClient().track(MixPanelEvent.ConnectClicked)
  }

  trackSwap(props: {
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
    this.getMixpanelClient().track(MixPanelEvent.Swap, props)
  }

  trackSwapClicked() {
    this.getMixpanelClient().track(MixPanelEvent.SwapClicked)
    this.getMixpanelClient().people.increment('Swap Clicked')
  }

  trackNavigateToTradePage(props: {
    market: string
    marketType: MarketType
    origin: TradeClickOrigin
  }) {
    this.getMixpanelClient().track(MixPanelEvent.TradeClicked, props)
  }

  trackWalletSelected(props: {
    wallet: Wallet
    userCountryFromVpnApi: string
    userCountryFromBrowser?: string
  }) {
    this.getMixpanelClient().track(MixPanelEvent.WalletSelected, props)
  }

  trackSurveyAccepted(surveyTitle: string) {
    this.getMixpanelClient().track(MixPanelEvent.SurveyAccepted, {
      surveyTitle
    })
  }

  trackSurveyRejected(surveyTitle: string) {
    this.getMixpanelClient().track(MixPanelEvent.SurveyRejected, {
      surveyTitle
    })
  }

  trackPlaceOrderAttempt(props: {
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
    this.getMixpanelClient().track(MixPanelEvent.PlaceOrderAttempt, props)
    this.getMixpanelClient().people.increment('Place Order Attempts')
  }

  trackPlaceOrderConfirm(props: {
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
    this.getMixpanelClient().track(MixPanelEvent.PlaceOrderConfirm, props)
    this.getMixpanelClient().people.increment('Place Order Confirms')
  }

  trackCreateStrategy(props: {
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

    this.getMixpanelClient().track(event, { ...props, isLiquidity: undefined })
    this.getMixpanelClient().people.increment(incrementEvent)
  }

  trackRemoveStrategy(props: {
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

    this.getMixpanelClient().track(event, { ...props, isLiquidity: undefined })
    this.getMixpanelClient().people.increment(incrementEvent)
  }

  private getMixpanelClient() {
    if (this.mixpanelClient) {
      return this.mixpanelClient
    }

    if (!this.mixpanelKey) {
      this.mixpanelClient = {
        init: () => {},
        track: () => {},
        reset: () => {},
        identify: () => {},
        people: {
          increment: () => {}
        }
      } as unknown as OverridedMixpanel

      return this.mixpanelClient
    }

    this.mixpanelClient = mixpanel
    this.mixpanelClient.init(this.mixpanelKey, {
      persistence: 'localStorage',
      batch_requests: false,
      track_pageview: true
    })

    return this.mixpanelClient as OverridedMixpanel
  }
}

export const mixpanelAnalytics = new MixPanelAnalytics(MIXPANEL_KEY)
