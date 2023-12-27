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

  login({
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

  logout() {
    this.getMixpanelClient().reset()
  }

  connectClicked() {
    this.getMixpanelClient().track(MixPanelEvent.ConnectClicked)
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
    this.getMixpanelClient().track(MixPanelEvent.Swap, props)
  }

  swapClicked() {
    this.getMixpanelClient().track(MixPanelEvent.SwapClicked)
    this.getMixpanelClient().people.increment('Swap Clicked')
  }

  navigateToTradePage(props: {
    market: string
    marketType: MarketType
    origin: TradeClickOrigin
  }) {
    this.getMixpanelClient().track(MixPanelEvent.TradeClicked, props)
  }

  walletSelected(props: {
    wallet: Wallet
    userCountryFromVpnApi: string
    userCountryFromBrowser?: string
  }) {
    this.getMixpanelClient().track(MixPanelEvent.WalletSelected, props)
  }

  surveyAccepted(surveyTitle: string) {
    this.getMixpanelClient().track(MixPanelEvent.SurveyAccepted, {
      surveyTitle
    })
  }

  surveyRejected(surveyTitle: string) {
    this.getMixpanelClient().track(MixPanelEvent.SurveyRejected, {
      surveyTitle
    })
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
    this.getMixpanelClient().track(MixPanelEvent.PlaceOrderAttempt, props)
    this.getMixpanelClient().people.increment('Place Order Attempts')
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
    this.getMixpanelClient().track(MixPanelEvent.PlaceOrderConfirm, props)
    this.getMixpanelClient().people.increment('Place Order Confirms')
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

    this.getMixpanelClient().track(event, { ...props, isLiquidity: undefined })
    this.getMixpanelClient().people.increment(incrementEvent)
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
      debug: true,
      batch_requests: false,
      track_pageview: true
    })

    return this.mixpanelClient as OverridedMixpanel
  }
}

export const mixpanelAnalytics = new MixPanelAnalytics(MIXPANEL_KEY)
