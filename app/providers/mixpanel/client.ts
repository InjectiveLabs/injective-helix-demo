import { SharedMarketType } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import mixpanel, { OverridedMixpanel } from 'mixpanel-browser'
import { OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { MIXPANEL_KEY } from '@/app/utils/constants/setup'
import {
  MixPanelEvent,
  ChartViewOption,
  OrderAttemptStatus,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

export class MixPanelAnalytics {
  mixpanelClient: OverridedMixpanel | undefined

  mixpanelKey: string

  constructor(mixpanelKey: string) {
    this.mixpanelKey = mixpanelKey
    this.mixpanelClient = undefined
  }

  trackWalletAddress({ injectiveAddress }: { injectiveAddress: string }) {
    this.getMixpanelClient().identify(injectiveAddress)
  }

  trackLogin({
    wallet,
    tierLevel,
    injectiveAddress
  }: {
    wallet: Wallet
    tierLevel: number
    injectiveAddress: string
  }) {
    this.getMixpanelClient().identify(injectiveAddress)

    this.getMixpanelClient().track(MixPanelEvent.Login, {
      Wallet: wallet,
      TierLevel: tierLevel,
      Address: injectiveAddress
    })

    this.getMixpanelClient().people.set({ wallet })
    this.getMixpanelClient().people.increment({ Login: 1, [wallet]: 1 })
  }

  trackLogout() {
    this.getMixpanelClient().reset()
  }

  trackBrowserLocation(props: {
    userCountryFromVpnApi: string
    userCountryFromBrowser?: string
  }) {
    this.getMixpanelClient().track(MixPanelEvent.BrowserLocation, props)
  }

  trackSwap(
    props: {
      fee: string
      rate: string | undefined
      inputAmount: string | undefined
      outputAmount: string | undefined
      outputToken: string | undefined
      inputToken: string | undefined
      minimumOutput: string
      slippageTolerance: string
    },
    error?: string
  ) {
    this.getMixpanelClient().track(MixPanelEvent.Swap, {
      ...props,
      fee: new BigNumberInBase(props.fee).toNumber(),
      rate: new BigNumberInBase(props.rate || 0).toNumber(),
      inputAmount: new BigNumberInBase(props.inputAmount || 0).toNumber(),
      outputAmount: new BigNumberInBase(props.outputAmount || 0).toNumber(),
      minimumOutput: new BigNumberInBase(props.minimumOutput).toNumber(),
      slippageTolerance: new BigNumberInBase(
        props.slippageTolerance
      ).toNumber(),
      error,
      status: error ? OrderAttemptStatus.Error : OrderAttemptStatus.Success
    })
    this.getMixpanelClient().people.increment(MixPanelEvent.SwapCount)
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

  trackCreateOrder(
    props: {
      market: string
      orderSide: OrderSide
      marketType: SharedMarketType
      tradingType: TradeExecutionType
      amount: string
      leverage: string
      limitPrice: string
      triggerPrice: string
      slippageTolerance: string
      reduceOnly?: boolean
      postOnly?: boolean
      chartType: ChartViewOption
    },
    error?: string
  ) {
    this.getMixpanelClient().track(MixPanelEvent.CreateOrder, {
      ...props,
      amount: new BigNumberInBase(props.amount || 0).toNumber(),
      leverage: new BigNumberInBase(props.leverage || 0).toNumber(),
      limitPrice: new BigNumberInBase(props.limitPrice || 0).toNumber(),
      triggerPrice: new BigNumberInBase(props.triggerPrice || 0).toNumber(),
      slippageTolerance: new BigNumberInBase(
        props.slippageTolerance || 0
      ).toNumber(),
      reduceOnly: !!props.reduceOnly,
      postOnly: !!props.postOnly,
      error,
      status: error ? OrderAttemptStatus.Error : OrderAttemptStatus.Success
    })
    this.getMixpanelClient().people.increment(MixPanelEvent.CreateOrderCount)
  }

  trackCreateStrategy({
    error,
    formValues,
    isLiquidity,
    market,
    marketPrice
  }: {
    error?: string
    formValues: Partial<SpotGridTradingForm>
    market: string
    marketPrice: string
    isLiquidity: boolean
  }) {
    const event = isLiquidity
      ? MixPanelEvent.CreateLiquidityBot
      : MixPanelEvent.CreateStrategy

    this.getMixpanelClient().track(event, {
      amountBase: new BigNumberInBase(
        formValues[SpotGridTradingField.BaseInvestmentAmount] || 0
      ).toNumber(),
      amountQuote: new BigNumberInBase(
        formValues[SpotGridTradingField.QuoteInvestmentAmount] || 0
      ).toNumber(),
      gridsNumber: new BigNumberInBase(
        formValues[SpotGridTradingField.Grids] || 0
      ).toNumber(),
      lowerPrice: new BigNumberInBase(
        formValues[SpotGridTradingField.LowerPrice] || 0
      ).toNumber(),
      upperPrice: new BigNumberInBase(
        formValues[SpotGridTradingField.UpperPrice] || 0
      ).toNumber(),
      market,
      marketPrice: new BigNumberInBase(marketPrice).toNumber(),
      error,
      status: error ? OrderAttemptStatus.Error : OrderAttemptStatus.Success
    })

    this.getMixpanelClient().people.increment(
      isLiquidity
        ? MixPanelEvent.CreateLiquidityBotCount
        : MixPanelEvent.CreateStrategyCount
    )
  }

  trackRemoveStrategy(
    props: {
      market: string
      pnl: string
      duration: string
      isLiquidity?: boolean
    },
    error?: string
  ) {
    const event = props.isLiquidity
      ? MixPanelEvent.RemoveLiquidityBot
      : MixPanelEvent.RemoveStrategy

    this.getMixpanelClient().track(event, {
      market: props.market,
      pnl: new BigNumberInBase(props.pnl).toNumber(),
      duration: new BigNumberInBase(props.duration).toNumber(),
      error,
      status: error ? OrderAttemptStatus.Error : OrderAttemptStatus.Success
    })
  }

  initMixPanel() {
    if (this.mixpanelClient) {
      return
    }

    this.mixpanelClient = {
      init: () => {},
      track: () => {},
      reset: () => {},
      identify: () => {},
      people: {
        set: () => {},
        increment: () => {}
      }
    } as unknown as OverridedMixpanel

    if (!this.mixpanelKey) {
      return
    }

    this.mixpanelClient = mixpanel
    this.mixpanelClient.init(this.mixpanelKey, {
      persistence: 'localStorage',
      batch_requests: false,
      track_pageview: 'full-url',
      ignore_dnt: true
    })
  }

  private getMixpanelClient() {
    if (this.mixpanelClient) {
      return this.mixpanelClient
    }

    if (!this.mixpanelKey) {
      this.initMixPanel()
    }

    return this.mixpanelClient as unknown as OverridedMixpanel
  }
}

export const mixpanelAnalytics = new MixPanelAnalytics(MIXPANEL_KEY)
